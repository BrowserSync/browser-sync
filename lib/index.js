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

var browserSync = new BrowserSync();

/**
 * @param {Array|Null} files
 * @param {Object} config
 * @param {Function} [cb]
 */
function start(files, config, cb) {
    return browserSync.init(files || [], config, pjson.version, cb);
}
module.exports.start = start;

/**
 * Handle Command-line usage
 */
if (require.main === module) {
    init.parse(pjson.version, args, argv, function (err, data) {
        if (err) {
            utils.fail(err, {}, true);
        }
        if (data.config) {
            start(data.files, data.config);
        }
        if (data.configFile) {
            info.makeConfig(argv);
        }
    });
}

/**
 * Handle External usage.
 * @param {Array} [userFiles]
 * @param {Object} [userConfig]
 * @param {Function} [cb]
 * @returns {exports.EventEmitter}
 */
module.exports.init = function (userFiles, userConfig, cb) {
    var config = _.merge(defaultConfig, userConfig);
    var files  = options._mergeFilesOption(userFiles, config.exclude);
    config = init.mergeOptions(defaultConfig, config, init.allowedOptions);
    return exports.start(files, config, cb);
};

/**
 * @param {String} name
 * @param {Function} func
 * @param {Function} [cb]
 */
module.exports.use = function (name, func, cb) {
    browserSync.registerPlugin(name, func, cb);
};