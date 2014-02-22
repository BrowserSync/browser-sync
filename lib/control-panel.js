"use strict";

var messages = require("./messages");
var snippetUtils = require("./snippet").utils;
var connect = require("connect");
var http = require("http");
var fs = require("fs");
var filePath = require("path");

//var connected = false;

var utils = {
    modifySnippet: function (host, port, options, clientScript) {

        var jsFile    = fs.readFileSync(__dirname + clientScript);
        var jsShims   = fs.readFileSync(__dirname + messages.client.shims);
        var result    = jsShims + jsFile;

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
module.exports.launchControlPanel = function (host, ports, options) {

    var clientScripts  = messages.clientScript(options, true);
    var modifySnippet = utils.modifySnippet(host, ports.socket, options, clientScripts.path);
    var baseDir       = __dirname + "/control-panel";
    var scriptTags = messages.scriptTags(host, ports, options, "controlPanel");

    var app = connect()
        .use(snippetUtils.getSnippetMiddleware(scriptTags))
        .use(clientScripts.versioned, modifySnippet)
        .use(connect.static(filePath.resolve(baseDir)));

    var controlPanelServer = http.createServer(app).listen(ports.controlPanel);

    return controlPanelServer;
};

module.exports.controlPanelEvents = [
    {
        name: "cp:goTo",
        callback: function (client, data) {
            client.broadcast.emit("location:update", {url: data.url});
        }
    },
    {
        name: "connection",
        callback: function (client, data) {
            console.log("connection event ", data);
        }
    }
];