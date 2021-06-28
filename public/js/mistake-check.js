var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE");

const msgs = [
    "Have you tried Chrome?",
    "Firefox also exists",
    "This thing doesn't even support the includes method for arrays...",
    "EI launched in 1995 and shouldn't be touched anymore",
    "I'm sorry that Internet Explorer is so bad that this while alert loop locks you out of user functionality. This only works on older versions.",
    "While you're here you should consider using Duckduckgo instead of Google or Bing. I'll let you look into it",
    "I wonder how old the PC/Laptop you're using is",
    "According to statcounter for Browsers, Internet Explorer takes up a whopping 0.71% of the global market share. Opera has more. Says a lot doesn't it.",
    "You probably still run Windows Vista",
    "Fuck IE, all my homies hate IE",
    "Why. Just why. You had so many choices and you chose Internet Explorer of all browsers.",
    "Humans definitely are the weak point of systems - you chose Internet Explorer. Firm evidence right there.",
    "Install a new browser and try again",
    "You should come off Internet Explorer literally now"
];

if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) { // IE
    document.title = "Internet Explorer is Bad";
    
    alert("Stop using this relic of a browser");
    alert("At least use Edge...");

    // eslint-disable-next-line no-constant-condition
    while (true) {
        do {
            var alertMsg = msgs[Math.floor(Math.random() * msgs.length)];
        } while ((alertMsg == alertMsgBuffer));
        
        var alertMsgBuffer = alertMsg;
        alert(alertMsg);
    }
}
