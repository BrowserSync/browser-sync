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

        this.options      = options;
        this.options.port = port;

        this.registerInternalEvents(options);

        // register internal events
        // Set global URL options
        utils.setUrlOptions(port, options);

        var clientJs = utils.getClientJs(port, options);

        // Start file watcher
        this.getPlugin("file:watcher")(files, options, this.events);

        var servers = this.servers = this.initServer(
            options.host,
            port,
            options,
            this.getPlugin("client:script")(options, clientJs, options.proxy ? "file" : "middleware")
        );

        this.io = this.getPlugin("socket")(servers.staticServer || servers.proxyServer, this.clientEvents, options, this.events);

        this.api = api.getApi(port, options, servers);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};