import {
    Queue,
    TerminalQueue
} from "/js/TerminalQueue.js";

import {
    getFile,
    getJSON,
    setCookie,
    getCookie,
    titleCase,
    escape,
    removeNewline,
    removeCarriage,
    findDiff,
    noOddHTML
} from "/js/functions.js";

/*
maxLines - amount of lines in terminal before deletion occurs
maxInpChars - max amount of characters allowed for user input per line
maxOutChars - max amount of output characters per line that can be displayed

staticPrefix - exists as a constant for the lowest level prefix, never changes
prefix - comes before each user input; originally pulls from staticPrefix
initial - temp var for the text right at the top (if applicable)
stdout - constantly updates to keep track of valid user input and entire console

terminal - a reference for the terminal div element

commandQueue - holds the last (maxLines) amount of inputs sent to the console
commandPos - keeps track of the command position in commandQueue. For when the users presses the Up and Down arrow 

actualDir - the current, actual directory the user is in (has "-"s instead of "/"s)
jsonDirCache - used to hold the last updated version of jsonDir in case of a loss of connection

consoleStdoutArr - holds 25 lines of valid contents of console {"pre":"", "inp": "", "out":""}. Updates every time a command is sent (Enter) 

filesCache - holds the last updated file data of each requested file in case of a loss of connection
*/

(async () => {
    const maxInpChars = 150;
    const maxOutChars = 1400;

    var theme = getCookie("terminal_theme");
    // No saved terminal theme, default to command prompt
    if (theme == null) {
        theme = "COMMAND PROMPT";
        var themeCSS = await getJSON("../terminals/command prompt.json");
    } else {
        themeCSS = await getJSON(`../terminals/${theme}.json`);
    }

    changeTheme(themeCSS["theme"], theme);

    const pathPlaceholder = "[PATH]";

    var staticPrefix = themeCSS["text"]["prefix"];
    if (themeCSS["text"]["prefix-escape"]) {
        staticPrefix = escape(staticPrefix);
    }

    var prefix = staticPrefix.replace(pathPlaceholder, "");

    var initial = themeCSS["text"]["initial"];
    if (themeCSS["text"]["initial-escape"]) {
        initial = escape(initial);
    }
    initial = initial + prefix;

    var consentMode = false;
    var cookieConsent = getCookie("consent");

    // Hasn't decided on allowing cookies or not
    if (cookieConsent == null) {
        consentMode = true;
        initial = `So, basically, in order to actually use my site you need to agree to letting me use Cookies. \
        \nIt just made the entirety of the backend a lot easier. \
        \n\n\nEssentially the site uses two Cookies: \
        \n<span style="color: darkcyan">Consent</span> - flag for whether you consent or not, only exists as true after you consent\
        \n<span style="color: darkcyan">Terminal Theme</span> - stores the terminal theme you used last so that it persists when you open the page up again \
        \n\n\nDo you consent to the use of these cookies [<span style="color: #A3FD62">Y</span>/<span style="color: tomato">N</span>]?\n\n${escape(">>>")} `;
    }

    var stdout = initial;

    // Setting console to initial output
    var terminal = document.getElementById("terminal");
    terminal.innerHTML = initial;
    terminal.addEventListener("input", input);
    terminal.addEventListener("keydown", keydown);
    terminal.addEventListener("paste", paste);

    var commandQueue = new Queue();
    var commandPos = -1;

    var actualDir = "";
    var jsonDirCache = null;

    var consoleStdoutArr = new TerminalQueue();
    consoleStdoutArr.addElement(initial);

    var filesCache = {};


    // Changes the current terminal CSS theme
    function changeTheme(dat, name) {
        for (const key in dat) {
            document.documentElement.style.setProperty(`--${key}`, dat[key]);
        }
        setCookie("terminal_theme", name.toLowerCase());
    }


    // Moves cursor to the end of the element
    function cursorToEnd(el) {
        var selection = window.getSelection();
        var range = document.createRange();
        selection.removeAllRanges();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.addRange(range);
        el.focus();
    }


    // Converts command string to command object, uppercases base command, preserves args
    function toCommand(s, upper = true) {
        var arr = s.split(" ");

        // Getting arg values
        var arg = [];
        if (arr.length > 1) arg = arr.slice(1, arr.length);

        if (upper == true && arr.length > 0) {
            arr[0] = arr[0].toUpperCase();
        }

        return {
            "base": arr[0],
            "args": arg
        };
    }


    // Generates a prefix from a LOT of args
    function generatePathPrefix(staticPrefix, directory, themeCSS) {
        // Determining whether a separator is needed before the path or not
        var seperator = "";
        if (directory != "") {
            seperator = themeCSS["text"]["cd"];
        }

        // Logic for path positioning in prefix based on current terminal theme
        return staticPrefix.replace(pathPlaceholder, `${seperator}${directory.replace("-", seperator)}`);
    }


    // Generates a tree from a given Object
    function recursiveDepthTree(tree, output = "", precursor = "") {
        const hori = "───";
        const link = "├";
        const term = "└";

        var treeArray = Object.keys(tree);
        const final = treeArray.length - 1;

        treeArray.forEach(key => {
            // If the key is "files", add all available file
            if (key == "files") {
                tree[key].forEach(e => {
                    var connector = link;
                    if (e == tree[treeArray[final]][tree[treeArray[final]].length - 1]) connector = term;
                    output += precursor + connector + hori + e + "\n";
                });
            }
            // Otherwise the key is a directory...
            else {
                // Directory Connector
                var connector = link;
                if (key == treeArray[final]) connector = term;
                output += precursor + connector + hori + key + "\n";

                // Precursor logic for final node in the tree
                if (tree[key] != tree[treeArray[final]]) {
                    output = recursiveDepthTree(tree[key], output, precursor + "│   ");
                } else output = recursiveDepthTree(tree[key], output, precursor + "    ");
            }
        });
        return output;
    }


    // Command Logic
    async function commandOutput(sc) {
        commandQueue.addElement(sc);
        var command = toCommand(sc);
        var out = "\n";
        var currentDir = actualDir;

        const commands = themeCSS["commands"];

        // jsonDir and jsonDirCache logic
        if ([commands["CD"], commands["DIR"], commands["TREE"]].indexOf(command.base) >= 0) {
            var jsonDir = await getJSON("../json/dir_structure.json");
            if (jsonDir == null && jsonDirCache == null) {
                console.warn("No jsonDir or backupDir enabled");
                out += "<span style=\"color: tomato\">Failed to fetch jsonDir. The web server might be down!</span>";
            } else if (jsonDir == null && jsonDirCache != null) {
                console.warn("jsonDir recovered from backup");
                jsonDir = jsonDirCache;
            } else if (jsonDir != null) {
                console.warn("backupJsonDir updated");
                jsonDirCache = jsonDir;
            }
        }

        // Massive command switch case for output logic
        switch (command.base) {
            case commands["SOURCE"]: {
                out += "You can access the source code at this ";
                out += "<a contenteditable=\"false\" target=\"_blank\" href=\"https://github.com/WiseNat/TerminalSite\">GitHub repository</a>";
                break;
            }
            case commands["ECHO"]: {
                // eslint-disable-next-line quotes
                out += command.args.join(" ");
                break;
            }
            case commands["CLS"]: {
                consoleStdoutArr.clear();
                consoleStdoutArr.addElement(prefix);
                return consoleStdoutArr.joinAll();
            }
            case commands["CD"]: {
                // Cancelling if jsonDir is unavailable
                if (jsonDir == null) {
                    break;
                }

                // Reformatting the given directory (user input)
                var splitArgs = command.args.join(" ").split("/");
                splitArgs = splitArgs.filter(function (el) {
                    return el != null && el != "";
                });

                // Creating directory path without any ".."s
                splitArgs.forEach(function (e) {
                    if (e == "..") {
                        if (currentDir != "") {
                            currentDir = currentDir.split("-");
                            currentDir.pop();
                            currentDir = currentDir.join("-");
                        }
                    } else {
                        if (currentDir == "") currentDir = e;
                        else currentDir += "-" + e;
                    }
                });

                // Checking if dir exists
                var exists = true;
                currentDir.split("-").forEach(function (e) {
                    if (e == "") return;
                    if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                    else exists = false;
                });

                // Outputs
                if (exists == false || actualDir == currentDir) {
                    out += "Directory doesn't exist";
                } else {
                    // Preventing the extra newline
                    out = "";

                    // Setting the actual directory to the current one
                    actualDir = currentDir;

                    // Generating prefix
                    prefix = generatePathPrefix(staticPrefix, currentDir, themeCSS);
                }
                break;
            }
            case commands["DIR"]: {
                // Cancelling if jsonDir is unavailable
                if (jsonDir == null) {
                    break;
                }

                // Getting to current dir in JSON object
                if (actualDir != "") {
                    actualDir.split("-").forEach(e => {
                        if (e == "") return;
                        if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                    });
                }

                // Appending output
                var filecount = 0;
                var dircount = 0;
                Object.keys(jsonDir).forEach(e => {
                    if (e == "files") {
                        filecount = jsonDir[e].length;
                        out += `<F>\t${jsonDir[e].join("\n<F>\t")}\n`;
                    } else {
                        dircount += 1;
                        out += `<DIR>\t${e}\n`;
                    }
                });

                out = escape(`${out.slice(0, out.length - 1)}\n\n${filecount} File(s)\n${dircount} Dir(s)`);
                break;
            }
            case commands["TREE"]: {
                // Cancelling if jsonDir is unavailable
                if (jsonDir == null) {
                    break;
                }

                // Get object of current directory location
                if (actualDir != "") {
                    var splitDir = actualDir.split("-");

                    splitDir.forEach(e => {
                        if (e == "") return;
                        if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                    });
                }

                // Generate the tree, remove final newline and add to the output
                out += `C:.\n${recursiveDepthTree(jsonDir).replace(/\n$/, "")}`;
                break;
            }
            case commands["CV"]: {
                out += "You can download my CV at ";
                out += "<a contenteditable=\"false\" href=\"CV.pdf\" download=\"\">this link</a>";
                break;
            }
            case commands["TERMINAL"]: {
                const userInput = command.args.join(" ");
                const terminal = await getJSON(`../terminals/${userInput}.json`);

                // No terminal theme found
                if (terminal == null) {
                    out += `Terminal theme <span style="color: #BF00BF">${titleCase(userInput)}</span> does not exist`;
                    break;
                }

                // Terminal theme found
                theme = userInput.toUpperCase();
                changeTheme(terminal["theme"], theme);

                staticPrefix = terminal["text"]["prefix"];
                if (terminal["text"]["prefix-escape"]) {
                    staticPrefix = escape(staticPrefix);
                }

                prefix = generatePathPrefix(staticPrefix, actualDir, terminal);
                themeCSS = terminal;

                out += `Changed the terminal to <span style="color: #BF00BF">${titleCase(userInput)}</span>`;
                break;
            }
            case commands["TERMLIST"]: {
                const term = await getJSON("/terminals");
                term["terminals"].forEach((el, ind, arr) => {
                    out += `--${titleCase(el)}`;
                    if (arr.length - 1 != ind) {
                        out += "\n";
                    }
                });
                break;
            }
            case commands["REFRESH"]: {
                window.location.reload();
                break;
            }
            case commands["HELP"]: {
                var messages = {
                    [commands["SOURCE"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["SOURCE"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Returns a URL for the source code of the site",
                    ],
                    [commands["ECHO"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["ECHO"]} *message`,
                        "\n<b>Arguments:</b>",
                        "  *message\tthe message you want returned to the console",
                        "\n<b>Info:</b>",
                        "  Displays a given message",
                    ],
                    [commands["CLS"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["CLS"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Clears the console",
                    ],
                    [commands["CD"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["CD"]} path`,
                        `  ${commands["CD"]} ..`,
                        "\n<b>Arguments:</b>",
                        "  path\t\tthe path to the directory. Use '..' as a directory name to navigate backwards",
                        "\n<b>Info:</b>",
                        "  Changes the current directory",
                    ],
                    [commands["DIR"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["DIR"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Displays a list of files and subdirectories in the current directory",
                    ],
                    [commands["TREE"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["TREE"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Graphically displays the directory structure of the current path",
                    ],
                    [commands["CV"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["CV"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Sends a link to download my current CV",
                    ],
                    [commands["TERMINAL"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["TERMINAL"]} *name`,
                        "\n<b>Arguments:</b>",
                        "  *name\t\tname of the terminal you want to change to",
                        "\n<b>Info:</b>",
                        "  Changes your current emulated terminal to another",
                    ],
                    [commands["TERMLIST"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["TERMLIST"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Returns all the available terminals used in the TERMINAL command",

                    ],
                    [commands["REFRESH"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["REFRESH"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Refresh the web page. If you want to use this instead of pressing F5 then go ahead",
                    ],
                    [commands["HELP"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["HELP"]}`,
                        `  ${commands["HELP"]} command`,
                        "\n<b>Arguments:</b>",
                        "  command\tthe command you want more specific information on",
                        "\n<b>Info:</b>",
                        "  Provides help information for the available commands",
                    ]
                };
                var keys = Object.keys(messages);
                if (command.args.length != 0) command.args[0] = command.args[0].toUpperCase();

                // Logic for which commands help to show
                if (keys.indexOf(command.args[0]) != -1) {
                    messages[command.args[0]].forEach(e => out += `${e}\n`);
                }
                // Show list of commands (tab for every 8th chars)
                else {
                    const maxTabs = Math.floor(Math.max(...(keys.map(el => el.length))) / 8) + 2;
                    keys.forEach(e => {
                        const tabs = "\t".repeat(maxTabs - Math.floor(e.length / 8));
                        out += `${e}${tabs}${messages[e][messages[e].length - 1]}\n`;
                    });
                }
                out = out.replace(/\n$/, "");
                break;
            }
            default: {
                // Keeping the case for command.base
                command = toCommand(sc, false);

                // File Request
                if (currentDir != "") currentDir += "-";
                currentDir += command.base + command.args.join(" ");

                const path = `../data/${currentDir}`;
                var fileData = await getFile(path);

                if (fileData == null && path in filesCache) {
                    fileData = filesCache[path];
                } else if (fileData != null) {
                    filesCache[path] = fileData;
                }

                // Check if input is a file
                if (fileData != null) {
                    out += escape(fileData).replace(
                        /(?:__|[*#])|\[(.*?)\]\((.*?)\)/gm,
                        "<a contenteditable=\"false\" target=\"_blank\" href=\"$1\">$2</a>"
                    );
                }
                // Not a valid filename... return help output
                else {
                    // eslint-disable-next-line quotes
                    out += `<span style="color: tomato">Run the help command</span>`;
                }
            }
        }

        // Output char limit (maxOutChars), cutting of chars that exceed that value
        if (out.length > maxOutChars) {
            out = out.substring(0, maxOutChars);
        }

        // Updating final element to include command and adding the new prefix
        out += "\n\n";
        consoleStdoutArr.last().inp = sc;
        consoleStdoutArr.last().out = removeCarriage(out);
        consoleStdoutArr.addElement(prefix);

        return consoleStdoutArr.joinAll();
    }


    async function input(event) {
        var char = event.data;
        var inpType = event.inputType;
        var consoleLiteral = noOddHTML(terminal.innerHTML);

        // TODO: Remove these in final product
        // console.warn(`LITERAL:\n${consoleLiteral}`);
        // console.log(`SAVED:\n${consoleStdoutArr.joinAll()}`);

        // If console was modified, revert change made by user.
        if (!consoleLiteral.startsWith(consoleStdoutArr.joinAll())) {
            // Add the character inputted into console if it isn't null and it won't make the current input exceed the max allowed input
            if (char != null && findDiff(consoleStdoutArr.joinAll(), consoleLiteral).length <= maxInpChars && !consentMode) {
                stdout += char;
            }
            terminal.innerHTML = stdout;

            // Set cursor to end
            cursorToEnd(terminal);

        }

        // If Enter key pressed
        else if (char == null && ["insertText", "insertLineBreak", "insertParagraph"].includes(inpType) && !consentMode) {
            terminal.contentEditable = false;

            // Retrieving command via difference between the consoleLiteral and the saved consoleStdoutArr values
            var final = await commandOutput(noOddHTML(findDiff(consoleStdoutArr.joinAll(), consoleLiteral)));

            // Setting the console to the new saved console and resetting the stdoutBuffer
            terminal.innerHTML = final;
            stdout = final;
            commandPos = -1;

            // Scrolling to bottom
            terminal.contentEditable = true;
            terminal.scrollTo(0, terminal.scrollHeight);
            cursorToEnd(terminal);
        }

        // No command inputted, no modified stdout, save current command progress
        else {
            var currentOut = findDiff(consoleStdoutArr.joinAll(), consoleLiteral);

            // Disable Newline pasting
            var currentOutNoNewline = removeNewline(currentOut);
            if (currentOut != currentOutNoNewline) {
                consoleLiteral = consoleStdoutArr.joinAll() + currentOutNoNewline;
                terminal.innerHTML = consoleLiteral;
            }

            if (consentMode) {
                currentOut = currentOut.toUpperCase();
                // Consent
                if (currentOut == "Y") {
                    setCookie("consent", "true");
                    window.location.reload();
                }
                // No consent
                else if (currentOut == "N") {
                    window.location.reload();
                }
                // Invalid Char
                else {
                    terminal.innerHTML = stdout;
                    cursorToEnd(terminal);
                }
                return;
            }

            // Input char limit (maxInpChars), cutting of chars that exceed that value
            if (currentOut.length > maxInpChars) {
                consoleLiteral = consoleStdoutArr.joinAll() + removeNewline(currentOut.substring(0, maxInpChars));
                terminal.innerHTML = consoleLiteral;
                cursorToEnd(terminal);
            }
            stdout = consoleLiteral;
        }
    }


    function keydown(event) {
        // Disable Bookmark tab and save site
        if (event.ctrlKey) {
            switch (event.key) {
                case "d":
                case "s":
                    event.preventDefault();
                    break;
            }
        }
        // Command Up and Down
        else {
            switch (event.key) {
                case "ArrowUp":
                    event.preventDefault();
                    if (commandPos < commandQueue.length - 1) {
                        commandPos += 1;
                        terminal.innerHTML = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                    }
                    terminal.scrollTo(0, terminal.scrollHeight);
                    cursorToEnd(terminal);
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    if (commandPos > 0) {
                        commandPos -= 1;
                        terminal.innerHTML = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                    }
                    // Back to no input
                    else if (commandPos == 0) {
                        commandPos -= 1;
                        terminal.innerHTML = consoleStdoutArr.joinAll();
                    }
                    terminal.scrollTo(0, terminal.scrollHeight);
                    cursorToEnd(terminal);
                    break;
            }
        }
    }


    function paste(event) {
        event.preventDefault();

        // Get text representation of clipboard
        var text = (event.originalEvent || event).clipboardData.getData("text/plain");

        // Insert text manually
        document.execCommand("insertHTML", false, text);
    }

    cursorToEnd(terminal);
})();