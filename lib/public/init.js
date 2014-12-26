"use strict";

var defaultConfig = require("../default-config");
var cliOptions    = require("../cli/cli-options");
var tfunk         = require("eazy-logger/node_modules/tfunk");

var merger         = require("opt-merger");

/**
 * @param {BrowserSync} browserSync
 * @param {String} [name]
 * @param {Object} pjson
 * @returns {Function}
 */
module.exports = function (browserSync, name, pjson) {

    return function () {

        if (browserSync.active) {
            return console.log(tfunk("Instance: {yellow:%s} is already running!"), name);
        }

        var args = Array.prototype.slice.call(arguments);

        args     = require("../args")(args);

        var config = merger.set({ignoreCli: true}).merge(defaultConfig, args.config || {}, cliOptions.callbacks);

        if (!config.server && !config.proxy) {
            config.open = false;
        }

        return browserSync.init(config.files || [], config, pjson.version, args.cb);
    };
};
