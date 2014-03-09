"use strict";

var messages     = require("./messages");
var config       = require("./config");
var snippetUtils = require("./snippet").utils;

var connect      = require("connect");
var http         = require("http");

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} scriptTags
 * @param {Object} options
 * @param {Function} scripts
 * @returns {http.Server}
 */
module.exports.launchControlPanel = function (scriptTags, options, scripts) {

    var clientScripts = messages.clientScript(options, true);

    var app =
        connect()
            .use(clientScripts.versioned, scripts)
            .use(clientScripts.path, scripts)
            .use(snippetUtils.getSnippetMiddleware(scriptTags))
            .use(connect.static(config.controlPanel.baseDir));

    return http.createServer(app);
};