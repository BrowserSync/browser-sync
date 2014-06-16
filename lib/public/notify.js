"use strict";

/**
 * @param {BrowserSync} browserSync
 * @returns {Function}
 */
module.exports = function (browserSync) {

    return function (msg) {

        if (msg) {
            browserSync.events.emit("browser:notify", {
                message: msg
            });
        }
    };
};