"use strict";

var messages = require("./messages");
var connect = require("connect");
var http = require("http");
var loadSnippet = require("./loadSnippet");
var fs = require("fs");
//var proxyModule = require("./proxy");
var filePath = require("path");
//var snippetUtils = require("./snippet").utils;

var utils = {
    modifySnippet: function (host, port, options) {

        var connector = messages.socketConnector(host, port);
        var jsFile    = fs.readFileSync(__dirname + messages.clientScript(options));
        var jsShims   = fs.readFileSync(__dirname + messages.client.shims);
        var result    = jsShims + connector + jsFile;

        return function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(result);
        };
    }
};

module.exports.utils = utils;

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {Object} ports
 * @param {Object} options
 * @param {socket} [io]
 * @returns {http.Server}
 */
module.exports.launchControlPanel = function (host, ports, options /*, io*/) {

    var modifySnippet = utils.modifySnippet(host, ports.socket, options);
    var baseDir = __dirname + "/control-panel";

    var app = connect()
        .use(loadSnippet(host, ports, options))
        .use(messages.clientScript(), modifySnippet)
        .use(connect.static(filePath.resolve(baseDir)));

    var controlPanelServer = http.createServer(app).listen(ports.controlPanel);

    return controlPanelServer;
};