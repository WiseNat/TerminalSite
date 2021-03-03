// Initialise Console
var prefix = "\nC:\\Users\\user>";
var stdout = "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n" + prefix;
var stdoutBuffer = stdout;
document.getElementById("myInput").value = stdout;

// Regex Safe String Generator
function escapeRegEx(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// TODO Make more efficient - store last position as index?, remove old stdouts? Comparisons will eventually be very slow
function input(event) {
    var char = event.data;
    var inpType = event.inputType;
    var regex = new RegExp("^" + escapeRegEx(stdout));
    var consoleVal = document.getElementById("myInput").value;
    
    /*  If Enter key pressed
        Second condition to remedy Chrome bug where entering <char><Enter>, only for the first input, counts as 'insertText'
        inpType instead of 'insertLineBreak')
    */ 
    if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")) {
        consoleVal = consoleVal.replace(/(\r\n|\n|\r)(?!.*(\r\n|\n|\r))/, "") + prefix;
        stdout = consoleVal;
        stdoutBuffer = consoleVal;
    }
    // If console was modified, revert change made by user
    else if (!regex.test(consoleVal)) {
        consoleVal = stdoutBuffer;
    }
    // No command inputted, no modified stdout, save current command progress
    else {
        stdoutBuffer = consoleVal;
    }

    // Applying relevant changes
    document.getElementById("myInput").value = consoleVal;
}