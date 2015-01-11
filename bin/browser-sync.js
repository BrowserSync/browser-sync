#!/usr/bin/env node
"use strict";

var meow          = require("meow");
var fs            = require("fs");
var path          = require("path");
var compile       = require("eazy-logger").compile;

var flags         = require("../lib/cli/opts");
var info          = require("../lib/cli/cli-info");
var logger        = require("../lib/logger").logger;
var merge         = require("../lib/cli/cli-options").merge;

var cmdWhitelist  = ["start", "init"];
var flagWhitelist = ["ghostMode", "reloadOnRestart"];

var cli = meow({
    pkg:  "../package.json",
    help: getHelpText("/../lib/cli/help.txt")
});

/**
 * Handle cli input
 */
handleCli(cli, cmdWhitelist);

/**
 * Generate & colour the help text
 * @param {String} filepath - relative file path to the help text
 * @returns {String}
 */
function getHelpText(filepath) {
    return compile(
        fs.readFileSync(
            path.resolve(__dirname + filepath),
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
 * @param {Object} cli
 * @param {Array} cmdWhitelist
 * @returns {*}
 */
function handleCli (cli, cmdWhitelist) {

    if (!cli.input.length || cmdWhitelist.indexOf(cli.input[0]) === -1) {
        return console.log(cli.help);
    }

    if (!verifyOpts(flagWhitelist, cli.flags)) {
        return logger.info("For help, run: {cyan:browser-sync --help}");
    }

    if (cli.input[0] === "start") {
        return require("../")
            .create("cli")
            .init(
                merge(
                    cli.flags.config ? info.getConfigFile(cli.flags.config) : cli.flags,
                    cli.flags
        ));
    }

    if (cli.input[0] === "init") {
        info.makeConfig(process.cwd());
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

module.exports = handleCli;