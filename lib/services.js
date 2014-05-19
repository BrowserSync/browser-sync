"use strict";

var controlPanel = require("./control-panel");
var messages     = require("./messages");
var api          = require("./api");
var fs           = require("fs");
var path         = require("path");
var utils        = require("./utils").utils;

/**
 * @param context
 * @returns {function(this:*)}
 */
module.exports.init = function (context) {

    /**
     * @this {BrowserSync}
     */
    return function (port, files, options) {

        var servers;

        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        utils.setUrlOptions(port, options);

        // Start file watcher
        this.getPlugin("file:watcher")(files, options, this.events);

        // Show the snippet if neither server or proxy running.
        if (!servers) {
            this.events.emit("snippet", {ports: port});
        }

        // Always Launch the control panel (which contains client script);
        var snippet   = messages.scriptTags(port, options, "controlPanel");
        var connector = fs.readFileSync(path.resolve(__dirname + "/../node_modules/socket.io-client/dist/socket.io.min.js"), "utf-8") + ";";
        var type      = options.proxy ? "file" : "middleware";
        connector    += messages.socketConnector(port);

        servers = this.initServer(options.host, port, options, this.getPlugin("client:script")(options, connector, type));

        this.io = this.getPlugin("socket")(servers.staticServer || servers.proxyServer, this.clientEvents, options, this.events);

        this.options = options;

        // get/emit the api
        this.api = api.getApi(port, options, servers);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};