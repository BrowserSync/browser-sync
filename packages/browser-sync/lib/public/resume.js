// @ts-check
"use strict";

/**
 * @param {import("../browser-sync")} browserSync
 * @returns {Function}
 */
module.exports = function(browserSync) {
    return function() {
        browserSync.paused = false;
    };
};
