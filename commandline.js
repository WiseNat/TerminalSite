// Initialise Console
var prefix = "\nC:\\Users\\user>";
var base = "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n" + prefix;
var stdoutBuffer = base;
document.getElementById("myInput").value = base;

// Regex Safe String Generator
function escapeRegEx(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// TODO Make more efficient - store last position as index?, remove old stdouts? Comparisons will eventually be very slow
function input(event) {
    var char = event.data;
    var inpType = event.inputType;
    var regex = new RegExp("^" + escapeRegEx(base));
    var stdout = document.getElementById("myInput").value;
    
    /*  If Enter key pressed
        Second condition to remedy Chrome bug where entering <char><Enter>, only for the first input, counts as 'insertText'
        inpType instead of 'insertLineBreak')
    */ 
    if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")) {
        stdout = stdout.replace(/(\r\n|\n|\r)(?!.*(\r\n|\n|\r))/,"") + prefix
        base = stdout;
    }
    // If stdout was modified, revert change made by user
    else if (!regex.test(stdout)) {
        stdout = stdoutBuffer;
    }
    // No command inputted, no modified stdout, save current command progress
    else {
        stdoutBuffer = stdout;
    }

    // Applying relevant changes
    document.getElementById("myInput").value = stdout;
}