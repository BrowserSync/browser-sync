"use strict";

/**
 * @type {{function: *}}
 */
module.exports = function (browserSync) {

    return function (arg) {

        function emitReload(path) {
            browserSync.events.emit("file:changed", {
                path: path
            });
        }

        function emitBrowserReload() {
            browserSync.events.emit("browser:reload");
        }

        if (typeof arg === "string") {
            return emitReload(arg);
        }

        if (Array.isArray(arg)) {
            return arg.forEach(emitReload);
        }

        if (arg && arg.stream === true) {

            // Handle Streams here...
            var emitted = false;
            var once    = arg.once || false;

            var Transform = require("stream").Transform;
            var reload = new Transform({objectMode:true});

            reload._transform = function(file, encoding, next) {

                if (once === true && !emitted) {
                    emitBrowserReload();
                    emitted = true;
                    this.push(file);
                    return next();
                } else {
                    if (once === true && emitted) {
                        return;
                    }
                    if (file.path) {
                        emitted    = true;
                        emitReload(file.path);
                    }
                }
                this.push(file);
                next();
            };
            return reload;
        }

        return emitBrowserReload();

    };
}