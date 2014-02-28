#! /usr/bin/env node
"use strict";

var argv = require("optimist").argv;
var BrowserSync = require("./browser-sync");
var pjson = require("../package.json");
var defaultConfig = require("./default-config");
var cliUtils = require("./cli").utils;
var cliInfo = require("./cli-info").info;

/**
 * Are we running from the command-line?
 */
if (require.main === module) {

    if (argv.version || argv.v) {
        return cliInfo.getVersion(pjson);
    }

    if (argv._[0] === "init") {
        return cliInfo.makeConfig();
    }

    var config   = cliUtils.getConfig(defaultConfig, argv),
        filesArg = cliUtils.getFilesArg(argv, config),
        files    = cliUtils.getFiles(filesArg);

    if (config.exclude) {
        files = cliUtils.mergeFiles(files, config.exclude);
    }

    var browserSync = new BrowserSync();

    browserSync.init(files || [], config, pjson.version);
}

/**
 * @param {String|Array} [files]
 * @param {Object} [userConfig]
 */
module.exports.init = function (files, userConfig) {
    var config = defaultConfig;
    if (userConfig) {
        config = cliUtils.mergeConfigObjects(defaultConfig, userConfig || {});
        if (files && userConfig.exclude) {
            files = cliUtils.mergeFiles(files, userConfig.exclude);
        }
    }
    var browserSync = new BrowserSync();
    browserSync.init(files || [], config, pjson.version);
};
