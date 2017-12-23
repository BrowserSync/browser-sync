import { Reloader } from "../vendor/Reloader";
import { Timer } from "../vendor/Timer";

const events = require("./events");
const utils = require("./browser.utils");
const emitter = require("./emitter");
const sync = exports;
const nanlogger = require("nanologger");
const log = nanlogger("Browsersync", { colors: { magenta: "#0F2634" } });
const reloader = new Reloader(window, log, Timer);

const options = {
    blacklist: [
        // never allow .map files through
        function(incoming) {
            return incoming.ext === "map";
        }
    ]
};

const OPT_PATH = "codeSync";
const current = function() {
    return window.location.pathname;
};

/**
 * @param {BrowserSync} bs
 */
sync.init = function(bs) {
    if (bs.options.scrollRestoreTechnique === "window.name") {
        sync.saveScrollInName(emitter);
    } else {
        sync.saveScrollInCookie(utils.getWindow(), utils.getDocument());
    }

    bs.socket.on("file:reload", sync.reload(bs));
    bs.socket.on("browser:reload", function() {
        if (bs.canSync({ url: current() }, OPT_PATH)) {
            sync.reloadBrowser(true, bs);
        }
    });
};

/**
 * Use window.name to store/restore scroll position
 */
sync.saveScrollInName = function() {
    var PRE = "<<BS_START>>";
    var SUF = "<<BS_END>>";
    var regex = new RegExp(PRE + "(.+?)" + SUF);
    var $window = utils.getWindow();
    var saved = {};

    /**
     * Listen for the browser:hardReload event.
     * When it runs, save the current scroll position
     * in window.name
     */
    emitter.on("browser:hardReload", function(data) {
        var newname = [
            $window.name,
            PRE,
            JSON.stringify({
                bs: {
                    hardReload: true,
                    scroll: data.scrollPosition
                }
            }),
            SUF
        ].join("");
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
sync.saveScrollInCookie = function($window, $document) {
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
 * @param {BrowserSync} bs
 * @returns {*}
 */
sync.reload = function(bs) {
    /**
     * @param data - from socket
     */
    return function(data) {
        if (!bs.canSync({ url: current() }, OPT_PATH)) {
            return;
        }

        var options = bs.options;

        if (data.url || !options.injectChanges) {
            sync.reloadBrowser(true);
        }

        if (data.basename && data.ext) {
            if (sync.isBlacklisted(data)) {
                return;
            }

            reloader.reload(data.path, { liveCSS: true });
        }
    };
};

/**
 * @param incoming
 * @returns {boolean}
 */
sync.isBlacklisted = function(incoming) {
    return options.blacklist.some(function(fn) {
        return fn(incoming);
    });
};

/**
 * @param confirm
 */
sync.reloadBrowser = function(confirm) {
    emitter.emit("browser:hardReload", {
        scrollPosition: utils.getBrowserScrollPosition()
    });
    if (confirm) {
        utils.reloadBrowser();
    }
};
