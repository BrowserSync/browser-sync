#! /usr/bin/env node
"use strict";

var BrowserSync   = require("./browser-sync");
var pjson         = require("../package.json");
var defaultConfig = require("./default-config");
var utils         = require("./utils");
var cli           = require("./cli");
var init          = cli.init;
var info          = cli.info;
var options       = cli.options;

var args          = require("optimist").argv;
var argv          = process.argv;

var _             = require("lodash");
var merge         = require("opt-merger").merge;

var browserSync   = new BrowserSync();

/**
 * @param {Array|Null} files
 * @param {Object} config
 * @param {Function} [cb]
 * @returns {BrowserSync}
 */
module.exports.start = function (files, config, cb) {
    return browserSync.init(files || [], config, pjson.version, cb);
};

/**
 * Handle Command-line usage
 */
if (require.main === module) {
    init.parse(pjson.version, args, argv, function (err, data) {
        if (err) {
            utils.fail(err, {}, true);
        }
        if (data.config) {
            exports.start(data.files, data.config);
        }
        if (data.configFile) {
            info.makeConfig();
        }
    });
}

/**
 * Exposed helper method for triggering reload
 * @param [arg]
 * @returns {*}
 */
module.exports.reload = require("./public/reload")(browserSync);

/**
 * @param {string} msg
 */
module.exports.notify = require("./public/notify")(browserSync);

/**
 * Handle External API usage.
 * @param {Object} [config]
 * @param {Function} [cb]
 * @returns {BrowserSync}
 */
module.exports.init = function (userConfig, cb) {

    var args   = require("./args")(arguments);
    var config = merge(_.cloneDeep(defaultConfig), args.config || {}, options.callbacks);

    if (!config.server && !config.proxy) {
        config.open = false;
    }

    return exports.start(config.files, config, args.cb);
};

/**
 * Allow plugins to be registered/overridden
 * @param {String} name
 * @param {Function} func
 * @param {Function} [cb]
 */
module.exports.use = function (name, func, cb) {
    browserSync.registerPlugin(name, func, cb);
};

/**
 * Export the emitter
 * @type {BrowserSync.events}
 */
module.exports.emitter = browserSync.events;

/**
 *
 */
module.exports.exit = function () {
    process.exit(0);
};
