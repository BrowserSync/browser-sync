#! /usr/bin/env node
"use strict";

var pjson         = require("../package.json");

var BrowserSync   = require("./browser-sync");
var utils         = require("./utils");
var cli           = require("./cli/");
var init          = cli.init;
var info          = cli.info;

var args          = require("optimist").argv;
var argv          = process.argv;

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
 * Handle External API usage.
 * @param {Object} [config]
 * @param {Function} [cb]
 * @returns {BrowserSync}
 */
var publicInit      = require("./public/init")(exports.start);

module.exports      = publicInit;
module.exports.init = publicInit; // backwards compat

/**
 * Exposed helper method for triggering reload
 * @param [arg]
 * @returns {*}
 */
module.exports.reload = require("./public/reload")(browserSync);

/**
 * Active flag for checking state of BS
 */
Object.defineProperty(module.exports, "active", {
    get: function () {
        return browserSync.active;
    }
});

/**
 * Exposed helper method for browser notifications
 * @param {String} msg
 */
module.exports.notify = require("./public/notify")(browserSync);

/**
 * Allow plugins to be registered/overridden
 * @param {String} name
 * @param {Function} func
 * @param {Function} [cb]
 */
module.exports.use = browserSync.registerPlugin;

/**
 * Export the emitter
 * @type {BrowserSync.events}
 */
module.exports.emitter = browserSync.events;
