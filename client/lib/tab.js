var utils        = require("./browser.utils");
var emitter      = require("./emitter");
var $document    = utils.getDocument();

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof $document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof $document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
} else if (typeof $document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof $document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}

// If the page is hidden, pause the video;
// if the page is shown, play the video
function handleVisibilityChange() {
    if ($document[hidden]) {
        emitter.emit("tab:hidden");
    } else {
        emitter.emit("tab:visible");
    }
}

if (typeof $document.addEventListener === "undefined" ||
    typeof $document[hidden] === "undefined") {
    //console.log('not supported');
} else {
    $document.addEventListener(visibilityChange, handleVisibilityChange, false);
}