class TerminalQueue extends Array {
    addElement(output, input = "") {
        if (this.length == maxLines) { // CHANGE TO 25
            this.shift();
        }
        this.push({
            "out": output,
            "cmd": input
        });
    }

    joinAll() {
        var res = [];
        this.forEach(ele => res.push(ele.out + ele.cmd));
        return res.join("");
    }

    joinEle(index) {
        return this[index].out + this[index].cmd;
    }

    last() {
        if (this.length == 0) return null;
        return this[this.length - 1];
    }
}