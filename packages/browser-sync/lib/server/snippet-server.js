// @ts-check
"use strict";

var connect = require("connect");
var serverUtils = require("./utils.js");

/**
 * Create a server for the snippet
 * @param {import("../browser-sync")} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createSnippetServer(bs, scripts) {
    var app = serverUtils.getBaseApp(bs);
    return serverUtils.getServer(app, bs.options);
};
