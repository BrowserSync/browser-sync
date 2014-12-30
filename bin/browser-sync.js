#!/usr/bin/env node
"use strict";

var meow          = require("meow");
var fs            = require("fs");
var path          = require("path");
var flags         = require("../lib/cli/opts");
var info          = require("../lib/cli/cli-info");
var compile       = require("eazy-logger").compile;
var logger        = require("../lib/logger").logger;
var merge         = require("../lib/cli/cli-options").merge;
var cmdWhitelist  = ["start", "init"];
var flagWhitelist = ["ghostMode"];

var cli = meow({
    pkg:  "../package.json",
    help: compile(
        fs.readFileSync(
            path.resolve(__dirname + "/../lib/cli/help.txt"),
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
    )
});

handleCli(cli, cmdWhitelist);

/**
 * @param cli
 * @param cmdWhitelist
 * @returns {*}
 */
function handleCli (cli, cmdWhitelist) {

    if (!cli.input.length || cmdWhitelist.indexOf(cli.input[0]) === -1) {
        return console.log(cli.help);
    }

    if (!verifyOpts(flags, cli.flags)) {
        return logger.info("For help, run: {cyan:browser-sync --help}");
    }

    if (cli.input[0] === "start") {
        return require("../").create("cli").init(merge(cli.flags, cli.flags));
    }

    if (cli.input[0] === "init") {
        info.makeConfig(process.cwd());
    }
}

/**
 * @param flag
 * @param cliFlags
 * @returns {*}
 */
function verifyOpts (flag, cliFlags) {
    return Object.keys(cliFlags).every(function (key) {
        if (flagWhitelist.indexOf("ghostMode") > -1) {
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
 * @param flags
 * @param longest
 * @returns {*}
 */
function listFlags (flags, longest) {
    return Object.keys(flags).reduce(function (all, item) {
        return all + "    {bold:--" + item + "}" + getPadding(item.length, longest + 8) + flags[item] + "\n";
    }, "");
}

/**
 * @param len
 * @param max
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