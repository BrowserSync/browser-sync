"use strict";

var defaultConfig = require("../default-config");
var cliOptions    = require("../cli/cli-options");

var merger         = require("opt-merger");

/**
 * @param {BrowserSync} browserSync
 * @param {Object} pjson
 * @returns {Function}
 */
module.exports = function (browserSync, pjson) {

    return function () {

        var args = Array.prototype.slice.call(arguments);
        args     = require("../args")(args);

        var config = merger.set({ignoreCli: true}).merge(defaultConfig, args.config || {}, cliOptions.callbacks);

        if (!config.server && !config.proxy) {
            config.open = false;
        }

        return browserSync.init(config.files || [], config, pjson.version, args.cb);
    };
};
