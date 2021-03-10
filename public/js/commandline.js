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


// Gets JSON Data
function getJSON(path) {
    return fetch(path).then(response => response.json());
}

// Removes newlines
function removeNewline(str) {
    return str.replace(/[\r\n]+/gm, "");
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
function toCommand(s) {
    var arr = s.split(" ");

    // Getting arg values
    var arg = [];
    if (arr.length > 1) arg = arr.slice(1, arr.length);

    return {
        "base": arr[0].toUpperCase(),
        "args": arg
    };
}


// Command Logic
async function commandOutput(sc) {
    commandQueue.addElement(sc);
    var command = toCommand(sc);
    var out = "\n";
    switch (command.base) {
        case "ECHO":
            out += command.args.join(" ");
            break;
        case "CLS":
            consoleStdoutArr.clear();
            consoleStdoutArr.addElement(prefix);
            return consoleStdoutArr.joinAll();
        case "CD":
            var currentDir = actualDir;
            var splitArgs = command.args.join(" ").split("/");
            splitArgs = splitArgs.filter(function (el) {
                return el != null;
            });
            splitArgs = splitArgs.filter(function (el) {
                return el != "";
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
                if (jsonDir[e] && e != "files") {
                    jsonDir = jsonDir[e];
                } else {
                    exists = false;
                    return;
                }
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

    // Output char limit (maxOutChars), cutting of chars that exceed that value
    if (out.length > maxOutChars) {
        out = out.substring(0, maxOutChars);
    }

    // Updating final element to include command and adding the new prefix
    consoleStdoutArr.last().inp = sc;
    consoleStdoutArr.last().out = out;
    consoleStdoutArr.addElement(prefix);

    return consoleStdoutArr.joinAll();
}


// TODO Make more efficient - store last position as index?
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