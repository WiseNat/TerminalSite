// Get File Data (txt)
async function getFile(path) {
    return fetch(path)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            return null;
        })
        .catch(error => {
            console.error(error);
            return null;
        });
}


// Gets JSON Data
async function getJSON(path) {
    return fetch(path)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return null;
        })
        .catch(error => {
            console.error(error);
            return null;
        });
}


// Sets a cookie
function setCookie(name, value, days) {
    var secure = "";
    if (navigator.userAgent.search("Firefox") > -1) {
        secure = " Secure;";
    }
    if (name == "consent" || getCookie("consent") != null) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${(value || "")}${expires}; path=/;${secure}`;
    }
}


// Josh was here and wants a cookie
// Gets a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


// Removes a cookie
function eraseCookie(name) {
    var secure = "";
    if (navigator.userAgent.search("Firefox") > -1) {
        secure = " Secure;";
    }
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;${secure}`;
}


// Title cases a given string
function titleCase(s) {
    return s.toLowerCase().split(" ").map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(" ");
}

// Replaces < and > symbols with named references
function escape(s) {
    return s.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}


// Removes newlines
function removeNewline(str) {
    return str.replace(/[\r\n]+/gm, "");
}


// Remove pesky \r
function removeCarriage(str) {
    return str.replace(/[\r]+/gm, "");
}


// Returns the difference of two strings
function findDiff(str1, str2) {
    let diff = "";
    str2.split("").forEach(function (val, i) {
        if (val != str1.charAt(i)) diff += val;
    });
    return diff;
}


// Removes <div><br></div>
function noOddHTML(s) {
    return s.replaceAll(/<div>|<\/div>|<br>/gm, "");
}


export {
    getFile,
    getJSON,
    setCookie,
    getCookie,
    eraseCookie,
    titleCase,
    escape,
    removeNewline,
    removeCarriage,
    findDiff,
    noOddHTML
};