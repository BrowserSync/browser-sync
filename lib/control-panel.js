"use strict";

var messages = require("./messages");
var connect = require("connect");
var http = require("http");
var loadSnippet = require("./loadSnippet");
var fs = require("fs");
var proxyModule = require("./proxy");
var filePath = require("path");
var snippetUtils = require("./snippet").utils;

var utils = {
};

module.exports.utils = utils;

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {Array} ports
 * @param {Object} options
 * @param {socket} io
 * @returns {{controlPanelServer: (http.Server)}}
 */
module.exports.launchControlPanel = function (host, ports, options, io) {

    var baseDir = __dirname + "/control-panel";
    var app = connect()
        .use(loadSnippet(host, ports[0], ports[1], options))
        .use(connect.static(filePath.resolve(baseDir)));

    var controlPanelServer = http.createServer(app).listen(ports[3]);

    return {
        controlPanelServer : controlPanelServer
    };
};