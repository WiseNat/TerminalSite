var maxLines = 20;


// HTML -> String
function datafy(s) {
    return s
        .replace(/<(?!br|\/br).+?>/gm, "") //  strip tags
        .replace(/<br>/g, "\n") //  <br> -> \n
        .replace(/&lt;/g, "<") //  &lt; -> <span
        .replace(/&gt;/g, ">") //  &gt; -> >
        .replace(/&amp;/g, "&") //  &amp; -> &
        .replace(/&quot;/g, "\"") //  &quot -> "
        .replace(/&apos;/g, "'") //  &apos -> '
        .replace(/&#x2F/g, "/") //  &#x2F -> /
        .replace(/&nbsp;/g, " "); //  &nbsp; -> ' '
}


// String -> HTML
function htmlfy(s) {
    return s
        // .replace(/&/g, "&amp;")    //       & -> &amp;
        .replace(/</g, "&lt;") //       < -> &lt;
        .replace(/>/g, "&gt;") //       > -> &gt;
        .replace(/"/g, "&quot;") //       " -> &quot;
        .replace(/'/g, "&apos;") //       ' -> &apos;
        .replace(/\//g, "&#x2F;"); //       / -> &#x2F;
    // .replace(/\n/g, "<br>")    //      \n -> <br>
    // .replace( / /g, "&nbsp;"); //     ' ' -> &nbsp;
}


class Queue extends Array {
    addElement(s) {
        if (this.length == maxLines) {
            this.shift();
        }
        this.push(s);
    }

    last() {
        if (this.length == 0) return null;
        return this[this.length - 1];
    }

    clear() {
        this.length = 0;
    }
}

class TerminalQueue extends Queue {
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
}

export {
    Queue,
    TerminalQueue,
    htmlfy,
    datafy
};