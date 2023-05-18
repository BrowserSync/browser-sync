// @ts-check
"use strict";

var connect = require("connect");
var serverUtils = require("./utils.js");

/**
 * Create a server for the snippet
 * @param {import("../browser-sync")} bs
 * @returns {*}
 */
module.exports = function createSnippetServer(bs) {
    var app = serverUtils.getBaseApp(bs);
    return serverUtils.getServer(app, bs.options);
};
