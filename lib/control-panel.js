"use strict";

var messages = require("./messages");
var snippetUtils = require("./snippet").utils;
var connect = require("connect");
var http = require("http");
var fs = require("fs");
var filePath = require("path");
var bsMiddleware = require("browser-sync-client").middleware();

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {Object} ports
 * @param {Object} options
 * @returns {http.Server}
 */
module.exports.launchControlPanel = function (host, ports, options) {

    var clientScripts  = messages.clientScript(options, true);
    var baseDir       = __dirname + "/control-panel";
    var scriptTags = messages.scriptTags(host, ports, options, "controlPanel");

    var app =
        connect()
            .use(snippetUtils.getSnippetMiddleware(scriptTags))
            .use(clientScripts.versioned, bsMiddleware)
            .use(connect.static(filePath.resolve(baseDir)));

    var controlPanelServer = http.createServer(app).listen(ports.controlPanel);

    return controlPanelServer;
};