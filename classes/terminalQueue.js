class TerminalQueue extends Array {
    addElement(prefix, input = "", output = "") {
        if (this.length == maxLines) {
            this.shift();
        }
        this.push({
            "pre": prefix,
            "inp": input,
            "out": output
        });
    }

    joinAll() {
        var res = [];
        this.forEach(ele => res.push(ele.pre + ele.inp + ele.out));
        return res.join("");
    }

    joinEle(index) {
        return this[index].pre + this[index].inp + this[index].out;
    }

    last() {
        if (this.length == 0) return null;
        return this[this.length - 1];
    }

    clear() {
        this.length = 0;
    }
}