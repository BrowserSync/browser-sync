"use strict";
var events  = require("./events");
var utils   = require("./browser.utils");
var emitter = require("./emitter");
var sync    = exports;

var options = {

    tagNames: {
        "css":  "link",
        "jpg":  "img",
        "jpeg": "img",
        "png":  "img",
        "svg":  "img",
        "gif":  "img",
        "js":   "script"
    },
    attrs: {
        "link":   "href",
        "img":    "src",
        "script": "src"
    },
    blacklist: [
        // never allow .map files through
        function(incoming) {
            return incoming.ext === "map";
        }
    ]
};

var hiddenElem;
var OPT_PATH = "codeSync";

var current = function () {
    return window.location.pathname;
};

/**
 * @param {BrowserSync} bs
 */
sync.init = function (bs) {

    if (bs.options.tagNames) {
        options.tagNames = bs.options.tagNames;
    }

    if (bs.options.scrollRestoreTechnique === "window.name") {
        sync.saveScrollInName(emitter);
    } else {
        sync.saveScrollInCookie(utils.getWindow(), utils.getDocument());
    }

    bs.socket.on("file:reload", sync.reload(bs));
    bs.socket.on("browser:reload", function () {
        if (bs.canSync({url: current()}, OPT_PATH)) {
            sync.reloadBrowser(true, bs);
        }
    });
};

/**
 * Use window.name to store/restore scroll position
 */
sync.saveScrollInName = function () {

    var PRE     = "<<BS_START>>";
    var SUF     = "<<BS_END>>";
    var regex   = new RegExp(PRE + "(.+?)" + SUF);
    var $window = utils.getWindow();
    var saved   = {};

    /**
     * Listen for the browser:hardReload event.
     * When it runs, save the current scroll position
     * in window.name
     */
    emitter.on("browser:hardReload", function (data) {
        var newname = [$window.name, PRE, JSON.stringify({
            bs: {
                hardReload: true,
                scroll:     data.scrollPosition
            }
        }), SUF].join("");
        $window.name = newname;
    });

    /**
     * On page load, check window.name for an existing
     * BS json blob & parse it.
     */
    try {
        var json = $window.name.match(regex);
        if (json) {
            saved = JSON.parse(json[1]);
        }
    } catch (e) {
        saved = {};
    }

    /**
     * If the JSON was parsed correctly, try to
     * find a scroll property and restore it.
     */
    if (saved.bs && saved.bs.hardReload && saved.bs.scroll) {
        utils.setScroll(saved.bs.scroll);
    }

    /**
     * Remove any existing BS json from window.name
     * to ensure we don't interfere with any other
     * libs who may be using it.
     */
    $window.name = $window.name.replace(regex, "");
};

/**
 * Use a cookie-drop to save scroll position of
 * @param $window
 * @param $document
 */
sync.saveScrollInCookie = function ($window, $document) {

    if (!utils.isOldIe()) {
        return;
    }

    if ($document.readyState === "complete") {
        utils.restoreScrollPosition();
    } else {
        events.manager.addEvent($document, "readystatechange", function() {
            if ($document.readyState === "complete") {
                utils.restoreScrollPosition();
            }
        });
    }

    emitter.on("browser:hardReload", utils.saveScrollPosition);
};

/**
 * @param {string} search
 * @param {string} key
 * @param {string} suffix
 */
sync.updateSearch = function(search, key, suffix) {

    if (search === "") {
        return "?" + suffix;
    }

    return "?" + search
        .slice(1)
        .split("&")
        .map(function (item) {
            return item.split("=");
        })
        .filter(function (tuple) {
            return tuple[0] !== key;
        })
        .map(function (item) {
            return [item[0], item[1]].join("=");
        })
        .concat(suffix)
        .join("&");
};

/**
 * @param elem
 * @param attr
 * @param options
 * @returns {{elem: HTMLElement, timeStamp: number}}
 */
sync.swapFile = function (elem, attr, options) {

    var currentValue = elem[attr];
    var timeStamp    = new Date().getTime();
    var key          = "rel";
    var suffix       = key + "=" + timeStamp;
    var anchor       = utils.getLocation(currentValue);
    var search       = sync.updateSearch(anchor.search, key, suffix);

    if (options.timestamps === false) {
        elem[attr] = anchor.href;
    } else {
        elem[attr] = anchor.href.split("?")[0] + search;
    }

    var body = document.body;

    setTimeout(function () {
        if (!hiddenElem) {
            hiddenElem = document.createElement("DIV");
            body.appendChild(hiddenElem);
        } else {
            hiddenElem.style.display = "none";
            hiddenElem.style.display = "block";
        }
    }, 200);

    return {
        elem: elem,
        timeStamp: timeStamp
    };
};

sync.getFilenameOnly = function (url) {
    return /^[^\?]+(?=\?)/.exec(url);
};

/**
 * @param {BrowserSync} bs
 * @returns {*}
 */
sync.reload = function (bs) {

    /**
     * @param data - from socket
     */
    return function (data) {

        if (!bs.canSync({url: current()}, OPT_PATH)) {
            return;
        }
        var transformedElem;
        var options = bs.options;
        var emitter = bs.emitter;

        if (data.url || !options.injectChanges) {
            sync.reloadBrowser(true);
        }

        if (data.basename && data.ext) {

            if (sync.isBlacklisted(data)) {
                return;
            }

            var domData = sync.getElems(data.ext);
            var elems   = sync.getMatches(domData.elems, data.basename, domData.attr);

            if (elems.length && options.notify) {
                emitter.emit("notify", {message: "Injected: " + data.basename});
            }

            for (var i = 0, n = elems.length; i < n; i += 1) {
                transformedElem = sync.swapFile(elems[i], domData.attr, options);
            }
        }

        return transformedElem;
    };
};

/**
 * @param fileExtension
 * @returns {*}
 */
sync.getTagName = function (fileExtension) {
    return options.tagNames[fileExtension];
};

/**
 * @param tagName
 * @returns {*}
 */
sync.getAttr = function (tagName) {
    return options.attrs[tagName];
};

/**
 * @param incoming
 * @returns {boolean}
 */
sync.isBlacklisted = function (incoming) {
    return options.blacklist.some(function(fn) {
        return fn(incoming);
    });
};

/**
 * @param elems
 * @param url
 * @param attr
 * @returns {Array}
 */
sync.getMatches = function (elems, url, attr) {

    if (url[0] === "*") {
        return elems;
    }

    var matches = [];
    var urlMatcher = new RegExp("(^|/)" + url);

    for (var i = 0, len = elems.length; i < len; i += 1) {
        if (urlMatcher.test(elems[i][attr])) {
            matches.push(elems[i]);
        }
    }

    return matches;
};

/**
 * @param fileExtension
 * @returns {{elems: NodeList, attr: *}}
 */
sync.getElems = function(fileExtension) {

    var tagName = sync.getTagName(fileExtension);
    var attr    = sync.getAttr(tagName);

    return {
        elems: document.getElementsByTagName(tagName),
        attr: attr
    };
};

/**
 * @param confirm
 */
sync.reloadBrowser = function (confirm) {
    emitter.emit("browser:hardReload", {
        scrollPosition: utils.getBrowserScrollPosition()
    });
    if (confirm) {
        utils.reloadBrowser();
    }
};
