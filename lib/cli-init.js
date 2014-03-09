"use strict";

var defaultConfig = require("./default-config");
var cliOptions    = require("./cli-options");
var info          = require("./cli-info");

var program       = require("commander");
var _             = require("lodash");

var allowedOptions = ["host", "server", "proxy"];
module.exports.allowedOptions = allowedOptions;

/**
 * @param {String} string
 * @returns {string}
 */
function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Template for creating a method name
 * @param {String} key
 * @returns {String}
 */
function methodName(key) {
    return "_merge%sOption".replace("%s", ucfirst(key));
}
module.exports.methodName = methodName;

/**
 * @param {Object} obj
 * @param {String} key
 * @param {Object} args
 * @returns {Object}
 */
function transformOption(obj, key, args) {
    if (args[key] && typeof obj[key] !== "undefined") {
        obj[key] = cliOptions[methodName(key)](obj[key], args[key]);
    }
    return obj;
}
module.exports.transformOption = transformOption;

/**
 * @param {Object} defaultConfig
 * @param {Object} args
 * @param {Array} allowedOptions
 * @returns {Object}
 */
function mergeOptions(defaultConfig, args, allowedOptions) {
    return allowedOptions
        .reduce(function (obj, key) {
            return transformOption(obj, key, args);
        }, defaultConfig);
}
module.exports.mergeOptions = mergeOptions;

/**
 * @param {String} version
 * @param {Object} args
 * @param {Function} cb
 */
module.exports.parse = function (version, args, cb) {

    program
        .version(version)
        .option("--server", "Run a Local server (uses your cwd as the web root)")
        .option("--proxy", "Proxy an existing server")
        .option("--files", "File paths to watch")
        .option("--no-comments", "Don't add comments to the config file")
        .option("--host", "Specify a hostname to use");

    program
        .command("init")
        .description("Creates a default config file")
        .action(function() {
            cb(null, {configFile: true});
        });

    program
        .command("start")
        .description("Start Browser Sync")
        .action(function() {

            var options;

            var userConfig = info._getDefaultConfigFile();

            if (userConfig) {
                options = _.merge(defaultConfig, userConfig);
                options = mergeOptions(defaultConfig, options, allowedOptions);
            } else {
                options = mergeOptions(defaultConfig, args, allowedOptions);
                options.files = cliOptions._mergeFilesOption(args.files, options.exclude);
            }

            cb(null, {
                files: options.files,
                config: options
            });
        });

    program.parse(process.argv);
};

