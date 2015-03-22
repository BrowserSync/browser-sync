"use strict";

var utils         = require("../utils");
var _             = require("lodash");
var defaultConfig = require("../default-config");
var stream        = require("./stream");

/**
 * @param emitter
 * @returns {Function}
 */
module.exports = function (emitter) {

    function emitReload(path, log) {
        emitter.emit("file:changed", {
            path: path,
            log: log,
            namespace: "core"
        });
    }

    function emitBrowserReload() {
        emitter.emit("browser:reload");
    }

    return function (arg) {

        /**
         * BACKWARDS COMPATIBILITY:
         * Passing an object as the only arg to the `reload`
         * method with at *least* the key-value pair of {stream: true},
         * was only ever used for streams support - so it's safe to check
         * for that signature here and defer to the
         * dedicated `.stream()` method instead.
         */
        if (_.isObject(arg)) {
            if (!Array.isArray(arg) && Object.keys(arg).length) {
                if (arg.stream === true) {
                    return stream(emitter)(arg);
                }
            }
        }

        if (typeof arg === "string" && arg !== "undefined") {
            return emitReload(arg, true);
        }

        if (Array.isArray(arg)) {

            if (utils.willCauseReload(arg, defaultConfig.injectFileTypes)) {
                return emitBrowserReload();
            }

            return arg.forEach(function (filepath) {
                emitReload(filepath, true);
            });
        }

        return emitBrowserReload();
    };
};
