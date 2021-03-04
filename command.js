// Converts command string to command object, uppercases base command, preserves args
function toCommand(s) {
    var arr = s.split(" ");

    // Getting arg values
    var arg = [];
    if (arr.length > 1) arg = arr.slice(1, arr.length);

    return {
        "base": arr[0].toUpperCase(),
        "args": arg
    }
}

// Command logic
function commandOutput(sc) {
    var command = toCommand(sc);
    var out = "\n";
    switch (command.base) {
        case "ECHO":
            out += command.args.join(" ");
            break
        case "CLS":
            consoleStdoutArr.clear()
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