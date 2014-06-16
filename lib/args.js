"use strict";


/**
 * Handle arguments for backwards compat
 * @param args
 * @returns {{config: {}, cb: *}}
 */
module.exports = function (args) {

    var config = {};
    var cb;

    switch(args.length) {
        case 1 :
            if (isFilesArg(args)) {
                config.files = args;
            }
            if (typeof args === "function") {
                cb = args;
            }
            break;
        case 2 :
            config = args[1] || {};

            if (!config.files) {
                config.files = args[0];
            }
            break;
        case 3 :
            config = args[1] || {};
            if (!config.files) {
                config.files = args[0];
            }
            cb = args[2];
    }

    function isFilesArg (arg) {
        return Array.isArray(arg) || typeof arg === "string";
    }

    return {
        config: config,
        cb: cb
    };
};