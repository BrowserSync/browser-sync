"use strict";

var messages     = require("./messages");
var snippetUtils = require("./snippet").utils;

var connect      = require("connect");
var http         = require("http");
var bsScripts    = require("browser-sync-client");

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} scriptTags
 * @param {Object} options
 * @returns {http.Server}
 */
module.exports.launchControlPanel = function (scriptTags, options) {

    var clientScripts = messages.clientScript(options, true);

    var app =
        connect()
            .use(clientScripts.versioned, bsScripts.middleware())
            .use(snippetUtils.getSnippetMiddleware(scriptTags))
            .use(connect.static(messages.controlPanel.baseDir));

    return http.createServer(app);
};