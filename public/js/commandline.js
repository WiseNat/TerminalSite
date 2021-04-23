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

const maxInpChars = 150;
const maxOutChars = 1400;

const staticPrefix = escape("\n\nC:\\Users\\user>");
var prefix = staticPrefix;
const initial = escape("Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n") + prefix;
var stdout = initial;

// Setting console to initial output
var terminal = document.getElementById("terminal");
terminal.innerHTML = initial;
terminal.addEventListener("input", input);
terminal.addEventListener("keydown", keydown);

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


// Regex Safe String Generator
function escapeRegEx(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}


// Removes <div><br></div>
function noOddHTML(s) {
    return s.replaceAll(/<div>|<\/div>|<br>/gm, "");
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


// Generates a tree from a given Object
function recursiveDepthTree(tree, output = "", precursor = "") {
    const term = "└";
    const link = "├";
    const hori = "───";

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
            out += '<span style="color: tomato">Failed to fetch jsonDir. The web server might be down!</span>';
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
            out += '<a contenteditable="false" target="_blank" href="https://github.com/WiseNat/TerminalSite">GitHub repository</a>';
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
            if (exists == false || actualDir == currentDir) out += "Directory doesn't exist";
            else if (currentDir == "") {
                prefix = staticPrefix;
                actualDir = currentDir;
            } else {
                prefix = escape(`${staticPrefix.slice(0, -4)}\\${currentDir.replace("-", "\\")}>`);
                actualDir = currentDir;
            }

            // Preventing the extra newline
            out = "";
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
            var header = "";
            if (actualDir != "") {
                var splitDir = actualDir.split("-");
                header = splitDir[splitDir.length - 1];
    
                splitDir.forEach(e => {
                    if (e == "") return;
                    if (jsonDir[e] && e != "files") jsonDir = jsonDir[e];
                });
            } else header = "C.";
    
            // Generate the tree, remove final newline and add to the output
            out += `${header}\n${recursiveDepthTree(jsonDir).replace(/\n$/, "")}`;
            break;
        }
        case "CV": {
            out += "You can download my CV at ";
            out += '<a contenteditable="false" href="CV.pdf" download="">this link</a>';
            break;
        }
        case "HELP": {
            var messages = {
                "SOURCE": [
                    "Returns a URL for the source code of the site",
                    "\nSOURCE",
                    "\nEx. SOURCE"
                ],
                "ECHO": [
                    "Displays a given message",
                    "\nECHO [*message]",
                    "\tmessage: the message you want to returned",
                    "\nEx. ECHO Hello, World!"
                ],
                "CLS": [
                    "Clears the screen",
                    "\nCLS",
                    "\nEx. CLS"
                ],
                "CD": [
                    "Changes the current directory",
                    "\nCD [path]",
                    "\tpath: a path to the directory you want to navigate to",
                    "\tUse '..' inside of a path to navigate back a directory",
                    "\nEx. CD Projects/Finished/../Work in Progress"
                ],
                "DIR": [
                    "Displays a list of files and subdirectories in the current directory",
                    "\nDIR",
                    "\nEx. DIR"
                ],
                "TREE": [
                    "Graphically displays the directory structure of the current path",
                    "\nTREE",
                    "\nEx. TREE"
                ],
                "CV": [
                    "Sends a link to download my current CV",
                    "\nCV",
                    "\nEx. CV"
                ],
                "HELP": [
                    "Provides help information for the available commands",
                    "\nHELP [command]",
                    "\tcommand: OPTIONAL, the command you want help for. If no command is given",
                    "\tthen a list of all commands will be shown",
                    "\nEx. HELP tree"
                ]
    
            };
            var keys = Object.keys(messages);
            if (command.args.length != 0) command.args[0] = command.args[0].toUpperCase();
    
            // Logic for which commands help to show
            if (keys.indexOf(command.args[0]) != -1) {
                messages[command.args[0]].forEach(e => out += `${e}\n`);
            } else keys.forEach(e => out += `${e}\t${messages[e][0]}\n`);
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
                    '<a contenteditable="false" target="_blank" href="$1">$2</a>'
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
    console.warn(`LITERAL: ${consoleLiteral}`);
    console.log(`SAVED: ${consoleStdoutArr.joinAll()}`);

    var regex = new RegExp(`^${escapeRegEx(consoleStdoutArr.joinAll())}`);

    // If console was modified, revert change made by user. 32768 chars max for Regex
    if (!regex.test(consoleLiteral)) {
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

cursorToEnd(terminal);