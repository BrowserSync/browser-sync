#! /usr/bin/env node
"use strict";

var pjson = require("../package.json");
var defaultConfig = require("./default-config");
var cliInfo = require("./cli-info").info;
var cliUtils = require("./cli").utils;
var argv = require("optimist").argv;

/**
 * Handle Command-line usage
 */
if (require.main === module) {

    require("./cli-init")(pjson.version, process.argv)
        .then(function (data) {
            if (data.files && data.config) {
                cliUtils._start(data.files, data.config, pjson.version);
            }
        });
}

/**
 * Return init method for external use
 * @param {String|Array} [files]
 * @param {Object} [userConfig]
 */
module.exports.init = function (files, userConfig) {
    if (userConfig) {
        var config = cliUtils.mergeConfigObjects(defaultConfig, userConfig || {});
        if (files && userConfig.exclude) {
            files = cliUtils.mergeFiles(files, userConfig.exclude);
        }
    }
    return cliUtils._start(files, config, pjson.version);
};
