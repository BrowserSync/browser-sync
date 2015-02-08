#!/usr/bin/env node
"use strict";

var meow          = require("meow");
var fs            = require("fs");
var path          = require("path");
var compile       = require("eazy-logger").compile;
var _             = require("lodash");
var utils         = require("../lib/utils");
var flags         = require("../lib/cli/opts");
var info          = require("../lib/cli/cli-info");
var logger        = require("../lib/logger").logger;

var cmdWhitelist  = ["start", "init"];
var flagWhitelist = Object.keys(flags).map(dropPrefix).map(_.camelCase);

var cli = meow({
    pkg:  "../package.json",
    help: getHelpText(path.resolve(__dirname, "../lib/cli/help.txt"))
});


/**
 * Handle cli input
 */
if (!module.parent) {
    handleCli({cli: cli, whitelist: cmdWhitelist});
}

/**
 * Generate & colour the help text
 * @param {String} filepath - relative file path to the help text
 * @returns {String}
 */
function getHelpText(filepath) {
    return compile(
        fs.readFileSync(
            filepath,
            "utf8"
        ).replace(
            "%flags%",
            listFlags(
                flags,
                longest(
                    Object.keys(flags)
                ).length
            )
        )
    );
}

/**
 * @param {{cli: object, [whitelist]: array, [cb]: function}} opts
 * @returns {*}
 */
function handleCli (opts) {

    opts.cb = opts.cb || utils.defaultCallback;

    var input = opts.cli.input;
    var flags = opts.cli.flags;

    if (!opts.whitelist) {
        opts.whitelist = cmdWhitelist;
    }

    if (!input.length || opts.whitelist.indexOf(input[0]) === -1) {
        return console.log(opts.cli.help);
    }

    if (!verifyOpts(flagWhitelist, flags)) {
        return logger.info("For help, run: {cyan:browser-sync --help}");
    }

    if (input[0] === "start") {
        return require("../")
            .create("cli")
            .init(flags.config ? info.getConfigFile(flags.config) : flags, opts.cb);
    }

    if (input[0] === "init") {
        info.makeConfig(process.cwd(), opts.cb);
    }
}

/**
 * @param {Array} flagWhitelist
 * @param {Object} cliFlags
 * @returns {Boolean}
 */
function verifyOpts (flagWhitelist, cliFlags) {
    return Object.keys(cliFlags).every(function (key) {
        if (flagWhitelist.indexOf(key) > -1) {
            return true;
        }
        if (!(key in flags)) {
            if (!("no-" + key in flags)) {
                logger.info("Unknown flag:  {yellow:`%s`", key);
                return false;
            }
        }
        return true;
    });
}

/**
 * @param {Object} flags
 * @param {Number} longest
 * @returns {String}
 */
function listFlags (flags, longest) {
    return Object.keys(flags).reduce(function (all, item) {
        return all + "    {bold:--" + item + "}" + getPadding(item.length, longest + 8) + flags[item] + "\n";
    }, "");
}

/**
 * @param {Number} len
 * @param {Number} max
 * @returns {string}
 */
function getPadding (len, max) {
    return new Array(max - (len + 1)).join(" ");
}

/**
 * @param {Array} arr
 * @returns {String}
 */
function longest (arr) {
    return arr.sort(function (a, b) { return b.length - a.length; })[0];
}

/**
 * @param {String} item
 * @returns {String}
 */
function dropPrefix (item) {
    return item.replace("no-", "");
}

module.exports = handleCli;
module.exports.getHelpText = getHelpText;