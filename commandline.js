/*
maxLines - amount of lines in terminal before deletion occurs
maxInpChars - max amount of characters allowed for user input per line
maxOutChars - max amount of output characters per line that can be displayed

prefix - comes before each user input
initial - temp var for the text right at the top (if applicable)
stdout - constantly updates to keep track of valid user input and entire console
consoleStdoutArr - holds 25 lines of valid contents of console {"out":"str", "inp": "str"}. Updates every time a command is sent (Enter) 
*/
var maxLines = 30;
var maxInpChars = 150;
var maxOutChars = 900;

var prefix = "\n\nC:\\Users\\user>";
var initial = `Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n${prefix}`;
var stdout = initial;
var commandPos = 0;

var consoleStdoutArr = new TerminalQueue();
consoleStdoutArr.addElement(initial);

// Setting console to initial output
document.getElementById("myInput").value = initial;


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


// TODO Make more efficient - store last position as index?
function input(event) {
    var char = event.data;
    var inpType = event.inputType;
    var consoleLiteral = document.getElementById("myInput").value;

    var regex = new RegExp(`^${escapeRegEx(consoleStdoutArr.joinAll())}`);

    // If console was modified, revert change made by user. 32768 chars max for Regex
    if (!regex.test(consoleLiteral)) {
        document.getElementById("myInput").value = stdout;
    }
    /*  If Enter key pressed
        Second condition to remedy Chrome bug where entering <char><Enter>, only for the first input, counts as 'insertText'
        event.inputType instead of 'insertLineBreak')
    */
    else if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")) {
        // Getting cursor position to remove newline (may not work on Unix or Mac, need to test)
        var cursorPosition = document.getElementById("myInput").selectionStart;
        consoleLiteral = consoleLiteral.slice(0, cursorPosition - 1) + consoleLiteral.slice(cursorPosition);

        // Retrieving command via difference between the consoleLiteral and the saved consoleStdoutArr values
        var final = commandOutput(findDiff(consoleStdoutArr.joinAll(), consoleLiteral))

        // Setting the console to the new saved console and resetting the stdoutBuffer
        document.getElementById("myInput").value = final;
        stdout = final;
        commandPos = 0;
    }
    // No command inputted, no modified stdout, save current command progress
    else {
        var currentOut = findDiff(consoleStdoutArr.joinAll(), consoleLiteral);

        // Input char limit (maxInpChars), cutting of chars that exceed that value
        if (currentOut.length > maxInpChars) {
            consoleLiteral = consoleStdoutArr.joinAll() + currentOut.substring(0, maxInpChars);
            document.getElementById("myInput").value = consoleLiteral;
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
                break
        }
    }
    // Command Up and Down
    else {
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                if (commandPos != consoleStdoutArr.length - 1) {
                    commandPos += 1;
                    document.getElementById("myInput").value = consoleStdoutArr.joinAll() + consoleStdoutArr[consoleStdoutArr.length - 1 - commandPos].inp;
                }
                break
            case "ArrowDown":
                event.preventDefault();
                if (commandPos != 0) {
                    commandPos -= 1;
                    document.getElementById("myInput").value = consoleStdoutArr.joinAll() + consoleStdoutArr[consoleStdoutArr.length - 1 - commandPos].inp;
                }
                break
        }
    }
}