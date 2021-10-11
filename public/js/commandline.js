import {
    Queue,
    TerminalQueue
} from "/js/terminal-queue.js";

import {
    getFile,
    getJSON,
    setCookie,
    getCookie,
    eraseCookie,
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

theme - name of the current terminal theme
themeCSS - JSON for all of the CSS for the current terminal theme
pathPlaceholder - constant to be replaced for each terminals prefix when running CD

staticPrefix - exists as a constant for the lowest level prefix, never changes
prefix - comes before each user input; originally pulls from staticPrefix
initial - temp var for the text right at the top (if applicable)

consentMode - whether to run terminal in consent mode, basically prompts the user for cookie consent
cookieConsent - cookie for whether the user has accepted consent or not. Doesn't exist if not.

stdout - constantly updates to keep track of valid user input and entire console

key - used to calculate finalFlow
finalFlow - stack for currentFlow
currentFlow - the current flow value

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

    var theme = getCookie("terminal-theme");
    var themeCSS = await getJSON(`../terminals/${theme}.json`);

    // No saved terminal theme, default to command prompt
    if (theme == null || themeCSS == null) {
        theme = "COMMAND PROMPT";
        themeCSS = await getJSON("../terminals/command prompt.json");
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
        \n\nSo, you can either <span style="color: #A3FD62">agree</span> to them or <span style="color: tomato">not</span> use the site - there's no alternative.
        \n\nEssentially the site uses two Cookies: \
        \n<span style="color: darkcyan">Consent</span> - flag for whether you consent or not, only exists as true after you consent\
        \n<span style="color: darkcyan">Terminal Theme</span> - stores the terminal theme you used last so that it persists when you open the page up again \
        \n\n\nDo you consent to the use of these cookies [<span style="color: #A3FD62">Y</span>/<span style="color: tomato">N</span>]?\n\nType in your response below\n${escape(">>>")} `;
    }

    var stdout = initial;

    var key = ["pUwOr", "nWoDwOrRa", "LwOrRa", "tHgIrWoR"];
    key.forEach((el, ind, key) => {
        el = el.split("");
        if (ind % 3 == 0) {
            key[ind] = `aR${el.reverse().join("")}`;
        } else if (ind == 2) {
            key[ind] = "tFe" + el.join("");
            key[ind] = key[ind].split("").reverse().join("");
        } else {
            key[ind] = el.reverse().join("");
        }
    });
    const finalFlow = ["Enter", String.fromCharCode(65), "B", key[3], key[2], key[3], key[2], key[1], key[1], key[0], key[0]].reverse();
    var currentFlow = 0;

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
        setCookie("terminal-theme", name.toLowerCase());
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


    // Check for consent
    function consentCheck(char) {
        if (char == "Y") {
            setCookie("consent", "true");
            window.location.reload();
        }
        // Invalid Char
        else {
            terminal.innerHTML = stdout;
            cursorToEnd(terminal);
        }
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
        return staticPrefix.replace(pathPlaceholder, `${seperator}${directory.replaceAll("-", seperator)}`);
    }

    function compressDir(dir, c = "/") {
        // Reformatting the given directory (user input)
        var splitArgs = dir.split("/");
        splitArgs = splitArgs.filter(function (el) {
            return el != null && el != "";
        });

        var dirBuffer = ""; 
        
        // Creating directory path without any ".."s
        splitArgs.forEach(function (e) {
            if (e == "..") {
                if (dirBuffer != "") {
                    dirBuffer = dirBuffer.split(c);
                    dirBuffer.pop();
                    dirBuffer = dirBuffer.join(c);
                }
            } else {
                if (dirBuffer == "") dirBuffer = e;
                else dirBuffer += c + e;
            }
        });

        return dirBuffer;
    }

    function generateDir(dir, currentDir, jsonDir) {
        // Reformatting the given directory (user input)
        currentDir = compressDir(dir, "-");
        
        // Checking if dir exists
        var exists = true;
        currentDir.split("-").forEach(function (e) {
            if (e == "") return;
            if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
            else exists = false;
        });

        if (exists == false) {
            return null;
        }
        return currentDir;
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
                out += "<span style=\"color: tomato\">Uuuuh, that's not good. You shouldn't ever see this message." +
                    "\nLooks like you failed to fetch jsonDir. You kind of need that." +
                    "\n\nTry the command again and pray.</span>";
            } else if (jsonDir == null && jsonDirCache != null) {
                console.log("jsonDir recovered from backup");
                jsonDir = jsonDirCache;
            } else if (jsonDir != null) {
                console.log("backupJsonDir updated");
                jsonDirCache = jsonDir;
            }
        }

        // Massive command switch case for output logic
        switch (command.base) {
            case commands["SOURCE"]: {
                out += "You can access the source code at this ";
                out += "<a target=\"_blank\" href=\"https://github.com/WiseNat/TerminalSite\" contenteditable=\"false\">GitHub repository</a>";
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

                currentDir = generateDir(command.args.join(" "), currentDir, jsonDir);

                // Outputs
                if (currentDir == null || actualDir == currentDir) {
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

                const dir = generateDir(command.args.join(" "), currentDir, jsonDir);
                if (dir != null) {
                    currentDir = dir;
                }

                // Get object of current directory location
                if (currentDir != "") {
                    var splitDir = currentDir.split("-");

                    splitDir.forEach(e => {
                        if (e == "") return;
                        if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                    });
                }

                // Generate the tree, remove final newline and add to the output
                out += `C:.\n${recursiveDepthTree(jsonDir, ).replace(/\n$/, "")}`;

                if (dir == null) {
                    out += "\n\nDirectory doesn't exist. Defaulting to <span style=\"color: #BF00BF\">current</span> directory.";
                }
                break;
            }
            case commands["CV"]: {
                out += "You can download my CV at ";
                out += "<a href=\"downloadables/CV.pdf\" download=\"\" contenteditable=\"false\">this link</a>";
                break;
            }
            case commands["TERMINAL"]: {
                const userInput = command.args.join(" ").toLowerCase();
                const terminal = await getJSON(`../terminals/${userInput}.json`);

                // No terminal theme found
                if (terminal == null) {
                    if (userInput.trim() == "") {
                        var term = await getJSON("/terminals");
                        term = term["terminals"];
                        const themeToTry = term[Math.floor(Math.random() * term.length)]; 
                        out += `You didn't enter a terminal theme.
                        \nTry <span style="color: #BF00BF">terminal ${themeToTry}</span>\nThat's a nice one`;
                    } else {
                        out += `Terminal theme <span style="color: #BF00BF">${titleCase(userInput)}</span> does not exist or couldn't be retrieved`;
                    }
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

                if (term == null) {
                    out += "<span style=\"color: tomato\">Failed to fetch the terminal list. You probably have a bad connection." +
                        "\n\nYou should try running the command again</span>";
                    break;
                }

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
            case commands["COOKIESLIST"]: {
                const cookies = ["consent", "terminal-theme"];
                const maxTabs = Math.floor(Math.max(...(cookies.map(el => el.length))) / 8) + 2;
                cookies.forEach(e => {
                    const tabs = "\t".repeat(maxTabs - Math.floor(e.length / 8));
                    out += `${e}${tabs}"${getCookie(e)}"\n`;
                });
                out = out.replace(/\n$/, "");
                break;
            }
            case commands["CLSCOOKIES"]: {
                eraseCookie("consent");
                eraseCookie("terminal-theme");
                out += "Cleared <b style=\"color: tomato\">ALL</b> cookies";
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
                        "  Lists files and subdirectories in the current directory",
                    ],
                    [commands["TREE"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["TREE"]}`,
                        `  ${commands["TREE"]} path`,
                        `  ${commands["TREE"]} ..`,
                        "\n<b>Arguments:</b>",
                        "  path\t\tthe path to the directory. Use '..' as a directory name to navigate backwards",
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
                        "  Why does this exist? No idea. Use F5 instead.",
                    ],
                    [commands["COOKIESLIST"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["COOKIESLIST"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Lists all cookies. That's it.",
                    ],
                    [commands["CLSCOOKIES"]]: [
                        "<b>Usage:</b>",
                        `  ${commands["CLSCOOKIES"]}`,
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Clears all cookies; including the consent cookie",
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
                    out += "Type \"HELP command\" to find out more about each command\nType a full filename to view it, e.g. \"help.txt\"\n\n";
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

                const path = "../data/" + compressDir(currentDir);
                console.log(path);
                var fileData = await getFile(path);

                if (fileData == null && path in filesCache) {
                    fileData = filesCache[path];
                } else if (fileData != null) {
                    filesCache[path] = fileData;
                }

                // Check if input is a file
                if (fileData != null) {
                    out += "\n" + escape(fileData).replace(
                        /\[(.*?)\]\((.*?)\)/gm,
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

        if (currentFlow == finalFlow.length) {
            out = "\n\n<span style=\"color: white;background-color:#A51918;font-family:TimesNewRoman;padding:5px;\">NICE TRY</span>";
            currentFlow = 0;
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
        // console.error(findDiff(consoleStdoutArr.joinAll(), consoleLiteral));

        // If console was modified, revert change made by user.
        if (!consoleLiteral.startsWith(consoleStdoutArr.joinAll())) {
            // Add the character inputted into console if it isn't null and it won't make the current input exceed the max allowed input
            if (char != null && findDiff(consoleStdoutArr.joinAll(), stdout + char).length <= maxInpChars) {
                // Consent mode char addition override
                if (consentMode) {
                    consentCheck(char.toUpperCase());
                }
                // Inp -> Stdin
                else {
                    stdout += char;
                }
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
                consentCheck(currentOut);
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
        if (event.ctrlKey && ["d", "s"].includes(event.key)) {
            event.preventDefault();
        // Disable command stack for highlighting
        } else if (event.shiftKey && ["ArrowUp", "ArrowDown"].includes(event.key)) {
            return;
        }
        // Command Up and Down
        else {
            if (event.key == "ArrowUp") {
                // Up command stack
                if (commandPos < commandQueue.length - 1) {
                    commandPos += 1;
                    terminal.innerHTML = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                }
            } else if (event.key == "ArrowDown") {
                // Down command stack
                if (commandPos > 0) {
                    commandPos -= 1;
                    terminal.innerHTML = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                }
                // Back to no input
                else if (commandPos == 0) {
                    commandPos -= 1;
                    terminal.innerHTML = consoleStdoutArr.joinAll();
                }
            }

            if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                event.preventDefault();
                terminal.scrollTo(0, terminal.scrollHeight);
                cursorToEnd(terminal);
            }

            if (finalFlow[currentFlow].toUpperCase() == event.key.toUpperCase()) {
                currentFlow += 1;
            } else {
                currentFlow = 0;
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