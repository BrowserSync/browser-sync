"use strict";

var scroll = require("./ghostmode.scroll");
var utils  = require("./browser.utils");

var styles = {
    display: "none",
    padding: "15px",
    fontFamily: "sans-serif",
    position: "fixed",
    fontSize: "0.9em",
    zIndex: 9999,
    right: 0,
    top: 0,
    borderBottomLeftRadius: "5px",
    backgroundColor: "#1B2032",
    margin: 0,
    color: "white",
    textAlign: "center",
    pointerEvents: "none"
};

var elem;
var options;
var timeoutInt;

/**
 * @param {BrowserSync} bs
 * @returns {*}
 */
exports.init = function (bs) {

    options     = bs.options;

    var cssStyles = styles;

    if (options.notify.styles) {

        if (Object.prototype.toString.call(options.notify.styles) === "[object Array]") {
            // handle original array behavior, replace all styles with a joined copy
            cssStyles = options.notify.styles.join(";");
        } else {
            for (var key in options.notify.styles) {
                if (options.notify.styles.hasOwnProperty(key)) {
                    cssStyles[key] = options.notify.styles[key];
                }
            }
        }
    }

    elem = document.createElement("DIV");
    elem.id = "__bs_notify__";

    if (typeof cssStyles === "string") {
       elem.style.cssText = cssStyles;
    } else {
        for (var rule in cssStyles) {
            elem.style[rule] = cssStyles[rule];
        }
    }

    var flashFn = exports.watchEvent(bs);

    bs.emitter.on("notify", flashFn);
    bs.socket.on("browser:notify", flashFn);

    return elem;
};

/**
 * @returns {Function}
 */
exports.watchEvent = function (bs) {
    return function (data) {
        if (bs.options.notify || data.override) {
            if (typeof data === "string") {
                return exports.flash(data);
            }
            exports.flash(data.message, data.timeout);
        }
    };
};

/**
 *
 */
exports.getElem = function () {
    return elem;
};

/**
 * @param message
 * @param [timeout]
 * @returns {*}
 */
exports.flash = function (message, timeout) {

    var elem  = exports.getElem();
    var $body = utils.getBody();

    // return if notify was never initialised
    if (!elem) {
        return false;
    }

    elem.innerHTML     = message;
    elem.style.display = "block";

    $body.appendChild(elem);

    if (timeoutInt) {
        clearTimeout(timeoutInt);
        timeoutInt = undefined;
    }

    timeoutInt = window.setTimeout(function () {
        elem.style.display = "none";
        if (elem.parentNode) {
            $body.removeChild(elem);
        }
    }, timeout || 2000);

    return elem;
};
