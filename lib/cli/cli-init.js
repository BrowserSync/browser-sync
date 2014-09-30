"use strict";

var defaultConfig = require("./../default-config");
var cliOptions    = require("./cli-options");
var info          = require("./cli-info");
var opts          = require("./opts.json");
var tfunk         = require("tfunk");

var program       = require("commander");
var merge         = require("opt-merger").merge;

module.exports.allowedOptions = ["host", "server", "proxy"];

/**
 * Handle command-line usage with 'start'
 * @param args
 * @param cb
 */
module.exports.startFromCommandLine = function (args, cb) {

    var userConfig;

    // First look for provided --config option
    if (args.config) {
        userConfig = info._getConfigFile(args.config);
    }

    var options = merge(defaultConfig, userConfig || {}, cliOptions.callbacks);

    cb(null, {
        files: options.files || [],
        config: options
    });
};

/**
 * @param {String} version
 * @param {Object} args - minimist object
 * @param {Object} argv
 * @param {Function} cb
 */
module.exports.parse = function (version, args, argv, cb) {

    program
        .version(version)
        .usage("<command> [options]");

    Object.keys(opts).forEach(function (key) {
        program.option(key, opts[key]);
    });

    program
        .on("--help", exports.help);

    program
        .command("init")
        .description("Creates a default config file")
        .action(function () {
            cb(null, {configFile: true});
        });

    program
        .command("start")
        .description("Start Browser Sync")
        .action(exports.startFromCommandLine.bind(null, args, cb));

    program.parse(argv);

    if (!args._.length) {
        program.help();
    }
};

/**
 * Help screen
 */
module.exports.help = function () {

    console.log(tfunk("  {bold:Server Example:"));
    console.log("  ---------------");
    console.log("    Use current directory as root & watch CSS files");
    console.log("");
    console.log(tfunk("    {magenta:$}{cyan: browser-sync start --server --files=\"css/*.css\""));
    console.log("");
    console.log(tfunk("  {bold:Proxy Example:"));
    console.log("  --------------");
    console.log("    Proxy `localhost:8080` & watch CSS files");
    console.log("");
    console.log(tfunk("    {magenta:$}{cyan: browser-sync start --proxy=\"localhost:8080\" --files=\"css/*.css\""));
    console.log("");
};
