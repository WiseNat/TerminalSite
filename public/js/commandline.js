import {
    Queue,
    TerminalQueue
} from "/js/TerminalQueue.js";

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

    var themeCSS = await getJSON("../terminals/command prompt.json");
    var theme = "COMMAND PROMPT";
    changeTheme(themeCSS["theme"]);

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

    // Get File Data (txt)
    async function getFile(path) {
        return fetch(path)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                return null;
            })
            .catch(error => {
                console.error(error);
                return null;
            });
    }


    // Gets JSON Data
    async function getJSON(path) {
        return fetch(path)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return null;
            })
            .catch(error => {
                console.error(error);
                return null;
            });
    }


    // Title cases a given string
    function titleCase(s) {
        return s.toLowerCase().split(" ").map(function(word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(" ");
    }

    // Replaces < and > symbols with named references
    function escape(s) {
        return s.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }


    // Removes newlines
    function removeNewline(str) {
        return str.replace(/[\r\n]+/gm, "");
    }


    // Remove pesky \r
    function removeCarriage(str) {
        return str.replace(/[\r]+/gm, "");
    }


    // Returns the difference of two strings
    function findDiff(str1, str2) {
        let diff = "";
        str2.split("").forEach(function (val, i) {
            if (val != str1.charAt(i)) diff += val;
        });
        return diff;
    }


    // Removes <div><br></div>
    function noOddHTML(s) {
        return s.replaceAll(/<div>|<\/div>|<br>/gm, "");
    }


    // Changes the current terminal CSS theme
    function changeTheme(dat) {
        for (const key in dat) {
            document.documentElement.style.setProperty(`--${key}`, dat[key]);
        }
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
    function generatePathPrefix(staticPrefix, directory, themeName, themeCSS){
        // Determining whether a separator is needed before the path or not
        var seperator = "";
        if (directory != "") {
            seperator = themeCSS["text"]["cd"];
        }
        
        // Logic for path positioning in prefix based on current terminal theme
        switch (themeName) {
            case "EXAMPLE THEME": {
                return `${staticPrefix}~~${directory.replace("-", "\\")}> `;
            }
            default: {
                return staticPrefix.replace(pathPlaceholder, `${seperator}${directory.replace("-", seperator)}`);
            }
        }
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

        // jsonDir and jsonDirCache logic
        if (["CD", "DIR", "TREE"].indexOf(command.base) >= 0) {
            var jsonDir = await getJSON("../json/dir_structure.json");
            if (jsonDir == null && jsonDirCache == null) {
                console.warn("No jsonDir or backupDir enabled");
                out += "<span style=\"color: tomato\">Failed to fetch jsonDir. The web server might be down!</span>";
            }
            else if (jsonDir == null && jsonDirCache != null) { 
                console.warn("jsonDir recovered from backup");
                jsonDir = jsonDirCache;
            }
            else if (jsonDir != null) {
                console.warn("backupJsonDir updated");
                jsonDirCache = jsonDir;
            }
        }

        // Massive command switch case for output logic
        switch (command.base) {
            case "SOURCE": {
                out += "You can access the source code at this ";
                out += "<a contenteditable=\"false\" target=\"_blank\" href=\"https://github.com/WiseNat/TerminalSite\">GitHub repository</a>";
                break;
            }
            case "ECHO": {
                // eslint-disable-next-line quotes
                out += `<span style="color: #A3FD62">${command.args.join(" ")}</span>`;
                break;
            }
            case "CLS": {
                consoleStdoutArr.clear();
                consoleStdoutArr.addElement(prefix);
                return consoleStdoutArr.joinAll();
            }
            case "CD": {
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
                }
                else {
                    // Preventing the extra newline
                    out = "";

                    // Setting the actual directory to the current one
                    actualDir = currentDir;

                    // Generating prefix
                    prefix = generatePathPrefix(staticPrefix, currentDir, theme, themeCSS);
                }
                break;
            }
            case "DIR": {
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
            case "TREE": {
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
            case "CV": {
                out += "You can download my CV at ";
                out += "<a contenteditable=\"false\" href=\"CV.pdf\" download=\"\">this link</a>";
                break;
            }
            case "TERMINAL": {
                const userInput = command.args.join(" ");
                const terminal = await getJSON(`../terminals/${userInput}.json`);
                
                // No terminal theme found
                if (terminal == null) { 
                    out += `Terminal theme <span style="color: violet">${titleCase(userInput)}</span> does not exist`;
                    break;
                }

                // Terminal theme found
                changeTheme(terminal["theme"]);
                theme = userInput.toUpperCase();

                staticPrefix = terminal["text"]["prefix"];
                if (terminal["text"]["prefix-escape"]) {
                    staticPrefix = escape(staticPrefix);
                }

                prefix = generatePathPrefix(staticPrefix, actualDir, theme, terminal);
                themeCSS = terminal;

                out += `Changed the terminal to <span style="color: violet">${titleCase(userInput)}</span>`;
                break;
            }
            case "HELP": {
                var messages = {
                    "SOURCE": [
                        "<b>Usage:</b>",
                        "  source",
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Returns a URL for the source code of the site",
                    ],
                    "ECHO": [
                        "<b>Usage:</b>",
                        "  echo *message",
                        "\n<b>Arguments:</b>",
                        "  *message\tthe message you want returned to the console",
                        "\n<b>Info:</b>",
                        "  Displays a given message",
                    ],
                    "CLS": [
                        "<b>Usage:</b>",
                        "  cls",
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Clears the console",
                    ],
                    "CD": [
                        "<b>Usage:</b>",
                        "  cd path",
                        "  cd ..",
                        "\n<b>Arguments:</b>",
                        "  path\t\tthe path to the directory. Use '..' as a directory name to navigate backwards",
                        "\n<b>Info:</b>",
                        "  Changes the current directory",
                    ],
                    "DIR": [
                        "<b>Usage:</b>",
                        "  dir",
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Displays a list of files and subdirectories in the current directory",
                    ],
                    "TREE": [
                        "<b>Usage:</b>",
                        "  tree",
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Graphically displays the directory structure of the current path",
                    ],
                    "CV": [
                        "<b>Usage:</b>",
                        "  cv",
                        "\n<b>Arguments:</b>",
                        "  None",
                        "\n<b>Info:</b>",
                        "  Sends a link to download my current CV",
                    ],
                    "TERMINAL": [
                        "<b>Usage:</b>",
                        "  terminal name",
                        "\n<b>Arguments:</b>",
                        "  name\tname of the terminal you want to change to",
                        "\n<b>Info:</b>",
                        "  Changes your current emulated terminal to another",
                    ],
                    "HELP": [
                        "<b>Usage:</b>",
                        "  help",
                        "  help command",
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
                    const maxTabs =  Math.floor(Math.max(...(keys.map(el => el.length))) / 8) + 2;
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
                }
                else if (fileData != null) {
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
        console.warn(`LITERAL:\n${consoleLiteral}`);
        // console.log(`SAVED:\n${consoleStdoutArr.joinAll()}`);

        // If console was modified, revert change made by user.
        if (!consoleLiteral.startsWith(consoleStdoutArr.joinAll())) {
            // Add the character inputted into console if it isn't null and it won't make the current input exceed the max allowed input
            if (char != null && findDiff(consoleStdoutArr.joinAll(), consoleLiteral).length <= maxInpChars) {
                stdout += char;
            }
            terminal.innerHTML = stdout;

            // Set cursor to end
            cursorToEnd(terminal);

        }

        // If Enter key pressed
        else if (char == null && ["insertText", "insertLineBreak", "insertParagraph"].includes(inpType)) {
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
