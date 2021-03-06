import { Queue, TerminalQueue } from "/js/TerminalQueue.js";

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
var maxInpChars = 150;
var maxOutChars = 900;

var prefix = "\n\nC:\\Users\\user>";
var initial = `Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n${prefix}`;
var stdout = initial;

var commandQueue = new Queue();
var commandPos = -1;

var consoleStdoutArr = new TerminalQueue();
consoleStdoutArr.addElement(initial);

// Setting console to initial output
document.getElementById("terminal").value = initial;
document.getElementById("terminal").addEventListener("input", input);
document.getElementById("terminal").addEventListener("keydown", keydown);


// Removes newlines
function removeNewline(str){
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
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
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
function commandOutput(sc){
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
function input(event) {
    var char = event.data;
    var inpType = event.inputType;
    var consoleLiteral = document.getElementById("terminal").value;

    var regex = new RegExp(`^${escapeRegEx(consoleStdoutArr.joinAll())}`);

    // If console was modified, revert change made by user. 32768 chars max for Regex
    if (!regex.test(consoleLiteral)) {
        if (char != null) {
            stdout += char;
        }
        document.getElementById("terminal").value = stdout;

    }
    /*  If Enter key pressed
        Second condition to remedy Chrome bug where entering <char><Enter>, only for the first input, counts as 'insertText'
        event.inputType instead of 'insertLineBreak')
    */
    else if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")) {
        // Getting cursor position to remove newline (may not work on Unix or Mac, need to test)
        var cursorPosition = document.getElementById("terminal").selectionStart;
        consoleLiteral = consoleLiteral.slice(0, cursorPosition - 1) + consoleLiteral.slice(cursorPosition);

        // Retrieving command via difference between the consoleLiteral and the saved consoleStdoutArr values
        var final = commandOutput(findDiff(consoleStdoutArr.joinAll(), consoleLiteral))

        // Setting the console to the new saved console and resetting the stdoutBuffer
        document.getElementById("terminal").value = final;
        stdout = final;
        commandPos = -1;
    }
    // No command inputted, no modified stdout, save current command progress
    else {
        var currentOut = findDiff(consoleStdoutArr.joinAll(), consoleLiteral);

        // Disable Newline pasting
        var currentOutNoNewline = removeNewline(currentOut);
        if (currentOut != currentOutNoNewline) {
            consoleLiteral = consoleStdoutArr.joinAll() + currentOutNoNewline;
            document.getElementById("terminal").value = consoleLiteral;
        }

        // Input char limit (maxInpChars), cutting of chars that exceed that value
        if (currentOut.length > maxInpChars) {
            consoleLiteral = consoleStdoutArr.joinAll() + removeNewline(currentOut.substring(0, maxInpChars));
            document.getElementById("terminal").value = consoleLiteral;
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
                document.getElementById("terminal").value = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
            }
            break;
        case "ArrowDown":
            event.preventDefault();
            if (commandPos > 0) {
                commandPos -= 1;
                document.getElementById("terminal").value = consoleStdoutArr.joinAll() + commandQueue[commandQueue.length - 1 - commandPos];
            }
            // Back to no input
            else if (commandPos == 0) {
                commandPos -= 1;
                document.getElementById("terminal").value = consoleStdoutArr.joinAll();
            }
            break;
        }
    }
}