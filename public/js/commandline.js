import {
    Queue,
    TerminalQueue
} from "/js/TerminalQueue.js";

/*
maxLines - amount of lines in terminal before deletion occurs
maxInpChars - max amount of characters allowed for user input per line
maxOutChars - max amount of output characters per line that can be displayed

prefix - comes before each user input
initial - temp var for the text right at the top (if applicable)
stdout - constantly updates to keep track of valid user input and entire console

commandQueue - holds the last (maxLines) amount of inputs sent to the console
commandPos - keeps track of the command position in commandQueue. For when the users presses the Up and Down arrow 

consoleStdoutArr - holds 25 lines of valid contents of console {"pre":"", "inp": "", "out":""}. Updates every time a command is sent (Enter) 
*/
const maxInpChars = 150;
const maxOutChars = 900;

const staticPrefix = "\n\nC:\\Users\\user>";
var prefix = staticPrefix;
const initial = `Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n${prefix}`;
var stdout = initial;

var commandQueue = new Queue();
var commandPos = -1;

var actualDir = "";

var consoleStdoutArr = new TerminalQueue();
consoleStdoutArr.addElement(initial);

var terminal = document.getElementById("terminal");

// Setting console to initial output
terminal.value = initial;
terminal.addEventListener("input", input);
terminal.addEventListener("keydown", keydown);

// Get File Data (txt)
async function getFile(path){
    return fetch(path).then(response => response.status === 200 ? response.text() : null);
}

// Gets JSON Data
async function getJSON(path) {
    return fetch(path).then(response => response.json());
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


// Regex Safe String Generator
function escapeRegEx(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}


// Converts command string to command object, uppercases base command, preserves args
function toCommand(s, upper=true) {
    var arr = s.split(" ");

    // Getting arg values
    var arg = [];
    if (arr.length > 1) arg = arr.slice(1, arr.length);

    if (upper == true && arr.length > 0){
        arr[0] = arr[0].toUpperCase();
    }

    return {
        "base": arr[0],
        "args": arg
    };
}


// Generates a tree from a given Object
function recursiveDepthTree(tree, output = "", precursor = "") {
    const term = "└";
    const link = "├";
    const hori = "───";

    var treeArray = Object.keys(tree);
    const final = treeArray.length - 1;

    treeArray.forEach(key => {
        // If the key is "files", add them all
        if (key == "files") {
            tree[key].forEach(e => {
                var connector = link;
                if (e == tree[treeArray[final]][tree[treeArray[final]].length - 1]) connector = term;
                output +=  precursor + connector + hori + e + "\n";
            });
        }
        // Else the key is a directory...
        else {
            // Directory Connector
            var connector = link;
            if (key == treeArray[final]) connector = term;
            output += precursor + connector + hori + key + "\n";
            
            // Precursor logic for final node
            if (tree[key] != tree[treeArray[final]]) {
                output = recursiveDepthTree(tree[key], output, precursor + "│   ");
            }
            else output = recursiveDepthTree(tree[key], output, precursor + "    ");
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

    switch (command.base) {
        case "ECHO": {
            out += command.args.join(" ");
            break;
        }
        case "CLS": {
            consoleStdoutArr.clear();
            consoleStdoutArr.addElement(prefix);
            return consoleStdoutArr.joinAll();
        }
        case "CD": {
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
            var jsonDir = await getJSON("../json/dir_structure.json");
            currentDir.split("-").forEach(function (e) {
                if (e == "") return;
                if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                else exists = false;
            });

            // Outputs
            if (exists == false) out += "Directory doesn't exist";
            else if (currentDir == "") {
                prefix = staticPrefix;
                actualDir = currentDir;
            } else {
                prefix = `${staticPrefix.slice(0, -1)}\\${currentDir.replace("-", "\\")}>`;
                actualDir = currentDir;
            }
            break;
        }
        case "DIR": {
            // Getting to current dir in JSON object
            var jsonDir = await getJSON("../json/dir_structure.json");
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
                    filecount += 1;
                    out += `\t${jsonDir[e].join("\nF ")}\n`;
                }
                else {
                    dircount += 1;
                    out += `<DIR>\t${e}\n`;
                }
                
            });

            out = `${out.slice(0, out.length - 1)}\n\n${filecount} File(s)\n${dircount} Dir(s)`;

            break;
        }
        case "TREE": {
            // Get object of current directory location
            var jsonDir = await getJSON("../json/dir_structure.json");
            var header = "";
            if (actualDir != "") {
                var splitDir = actualDir.split("-");
                header = splitDir[splitDir.length - 1];
                
                splitDir.forEach(e => {
                    if (e == "") return;
                    if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                });
            }
            else header = "C.";

            // Generate the tree, remove final newline and add to the output
            out += header + "\n" + recursiveDepthTree(jsonDir).replace(/\n$/, "");
            break;
        }
        case "HELP": {
            out += ["ECHO <message> - outputs your message",
                "CLS - clears the screen",
                "CD <path> - navigates you to that path. Use '..' to get back",
                "DIR - shows file names and folders under the current directory",
                "TREE - shows a tree of EVERY file and folder under the current directory"].join("\n");
            break;
        }
        default: {
            // Keeping the case for command.base
            command = toCommand(sc, false);

            // File Request
            if (currentDir != "") currentDir += "-";
            currentDir += command.base + command.args.join(" ");
            var fileData = await getFile(`../data/${currentDir}`);
            // Check if input is a file
            if (fileData != null){
                out += fileData;
            }
            // Not a file... return help output
            else {
                out += "Run the help command";
            }
        }
    }

    // Output char limit (maxOutChars), cutting of chars that exceed that value
    if (out.length > maxOutChars) {
        out = out.substring(0, maxOutChars);
    }

    // Updating final element to include command and adding the new prefix
    consoleStdoutArr.last().inp = sc;
    consoleStdoutArr.last().out = removeCarriage(out);
    consoleStdoutArr.addElement(prefix);

    return consoleStdoutArr.joinAll();
}


async function input(event) {
    var char = event.data;
    var inpType = event.inputType;
    var consoleLiteral = terminal.value;

    var regex = new RegExp(`^${escapeRegEx(consoleStdoutArr.joinAll())}`);

    // If console was modified, revert change made by user. 32768 chars max for Regex
    if (!regex.test(consoleLiteral)) {
        if (char != null) {
            stdout += char;
        }
        terminal.value = stdout;

    }
    /*  If Enter key pressed
        Second condition to remedy Chrome bug where entering <char><Enter>, only for the first input, counts as 'insertText'
        event.inputType instead of 'insertLineBreak')
    */
    else if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")) {
        // Getting cursor position to remove newline (may not work on Unix or Mac, need to test)
        var cursorPosition = terminal.selectionStart;
        consoleLiteral = consoleLiteral.slice(0, cursorPosition - 1) + consoleLiteral.slice(cursorPosition);

        // Retrieving command via difference between the consoleLiteral and the saved consoleStdoutArr values
        var final = await commandOutput(findDiff(consoleStdoutArr.joinAll(), consoleLiteral));

        // Setting the console to the new saved console and resetting the stdoutBuffer
        terminal.value = final;
        stdout = final;
        commandPos = -1;

        // Scrolling to bottom
        terminal.scrollTo(0, terminal.scrollHeight);


    }
    // No command inputted, no modified stdout, save current command progress
    else {
        var currentOut = findDiff(consoleStdoutArr.joinAll(), consoleLiteral);

        // Disable Newline pasting
        var currentOutNoNewline = removeNewline(currentOut);
        if (currentOut != currentOutNoNewline) {
            consoleLiteral = consoleStdoutArr.joinAll() + currentOutNoNewline;
            terminal.value = consoleLiteral;
        }

        // Input char limit (maxInpChars), cutting of chars that exceed that value
        if (currentOut.length > maxInpChars) {
            consoleLiteral = consoleStdoutArr.joinAll() + removeNewline(currentOut.substring(0, maxInpChars));
            terminal.value = consoleLiteral;
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
                    terminal.value = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                }
                break;
            case "ArrowDown":
                event.preventDefault();
                if (commandPos > 0) {
                    commandPos -= 1;
                    terminal.value = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
                }
                // Back to no input
                else if (commandPos == 0) {
                    commandPos -= 1;
                    terminal.value = consoleStdoutArr.joinAll();
                }
                break;
        }
    }
}