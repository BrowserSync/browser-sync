#!/usr/bin/env node
"use strict";

var meow          = require("meow");
var fs            = require("fs");
var path          = require("path");
var compile       = require("eazy-logger").compile;
var utils         = require("../lib/utils");
var flags         = require("../lib/cli/opts");
var flagKeys      = Object.keys(flags);

var cmdWhitelist  = ["start", "init", "reload"];

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
                    flagKeys
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

    if (input[0] === "start") {
        require("../lib/cli/command.start")(opts);
    }

    if (input[0] === "init") {
        require("../lib/cli/command.init")(opts);
    }

}

/**
 * @param {Object} flags
 * @param {Number} longest
 * @returns {String}
 */
function listFlags (flags, longest) {
    return flagKeys.reduce(function (all, item) {
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
module.exports.getHelpText = getHelpText;