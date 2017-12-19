"use strict";

/**
 * @param {BrowserSync} browserSync
 * @returns {Function}
 */
module.exports = function (emitter) {

    return function (msg, timeout) {

        if (msg) {
            emitter.emit("browser:notify", {
                message: msg,
                timeout: timeout || 2000,
                override: true
            });
        }
    };
};
