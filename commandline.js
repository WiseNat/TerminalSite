// Initialise Console
var prefix = "\nC:\\Users\\user>";
var base = "Microsoft Windows [Version 10.0.18363.1379]\n(c) 2019 Microsoft Corporation. All rights reserved.\n" + prefix;
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
    if (inpType == "insertLineBreak" || (char == null && inpType == "insertText")){
        document.getElementById("myInput").value = document.getElementById("myInput").value.replace(/(\r\n|\n|\r)(?!.*(\r\n|\n|\r))/,"")
        document.getElementById("myInput").value += prefix;
        base = document.getElementById("myInput").value;
        
    } 
    if (!regex.test(stdout)) {
        document.getElementById("myInput").value = base;
    }
}