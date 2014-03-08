#! /usr/bin/env node
"use strict";

var BrowserSync   = require("./browser-sync");
var pjson         = require("../package.json");
var defaultConfig = require("./default-config");
var utils         = require("./utils");
var cli           = require("./cli");
var init          = cli.init;
var options       = cli.options;

var argv          = require("optimist").argv;
var _             = require("lodash");

/**
 * @param {Array|Null} files
 * @param {Object} config
 * @param {Function} [cb]
 */
function start(files, config, cb) {
    var browserSync = new BrowserSync();
    return browserSync.init(files || [], config, pjson.version, cb);
}

/**
 * Handle Command-line usage
 */
if (require.main === module) {
    init.parse(pjson.version, argv, function (err, data) {
        if (err) {
            utils.fail(err, {}, true);
        }
        if (data.config) {
            start(data.files, data.config);
        }
    });
}

/**
 * Handle External usage.
 * @param {Object} [userConfig]
 * @param userFiles
 * @returns {exports.EventEmitter}
 */
module.exports.init = function (userFiles, userConfig, cb) {
    var config = _.merge(defaultConfig, userConfig);
    var files  = options._mergeFilesOption(userFiles, config.exclude);
    return start(files, config, cb);
};
