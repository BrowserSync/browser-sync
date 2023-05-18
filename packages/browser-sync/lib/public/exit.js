// @ts-check
"use strict";

/**
 * @param {import("../browser-sync")} browserSync
 * @returns {Function}
 */
module.exports = function(browserSync) {
    function exit() {
        if (browserSync.active) {
            browserSync.events.emit("service:exit");
            browserSync.cleanup();
        }
    }

    return exit;
};
