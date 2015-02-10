"use strict";

var path          = require("path");
var utils         = require("../utils");
var defaultConfig = require("../default-config");

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

    function emitInfo(changed) {
        emitter.emit("stream:changed", {changed: changed});
    }

    return function (arg) {

        if (typeof arg === "string") {
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

        if (arg && arg.stream === true) {

            // Handle Streams here...
            var emitted   = false;
            var once      = arg.once || false;
            var Transform = require("stream").Transform;
            var reload    = new Transform({objectMode:true});
            var changed   = [];

            reload._transform = function (file, encoding, next) {

                if (once === true && !emitted) {

                    emitBrowserReload();

                    emitted = true;

                } else { // handle multiple

                    if (once === true && emitted) {

                    } else {

                        if (file.path) {

                            emitted    = true;
                            emitReload(file.path, false);
                            changed.push(path.basename(file.path));
                        }
                    }
                }

                this.push(file); // always send the file down-stream

                next();
            };

            reload._flush = function (next) {

                if (changed.length) {
                    emitInfo(changed);
                }

                next();
            };

            return reload;
        }

        return emitBrowserReload();

    };
};
