"use strict";

var controlPanel = require("./control-panel");
var messages = require("./messages");
var api = require("./api");
var fs  = require("fs");
var utils = require("./utils").utils;

/**
 * @param context
 * @returns {function(this:*)}
 */
module.exports.init = function (context) {

    /**
     * @this {BrowserSync}
     */
    return function (ports, files, options) {

        var servers;


        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        utils.setUrlOptions(ports, options);

        // Start file watcher
        this.getPlugin("file:watcher")(files, options, this.events);

        // launch the server/proxy

        if (!servers) {
            this.events.emit("snippet", {ports: ports});
        }

        // Always Launch the control panel (which contains client script);
        var snippet   = messages.scriptTags(ports, options, "controlPanel");
        var connector = fs.readFileSync("./node_modules/socket.io-client/dist/socket.io.js", "utf-8") + ";";
        connector    += messages.socketConnector(ports.server);

        var cpPlugin = this.getPlugin("controlpanel");
        var cp;

//        if (cpPlugin) {
//            cp = cpPlugin(options, snippet, connector, this);
//        }

        servers = this.initServer(options.host, ports, options, this.getPlugin("client:script")(options, connector));

//        var cpServer = controlPanel
//            .launchControlPanel(options, this.getPlugin("client:script")(options, connector), cp)
//            .listen(ports.controlPanel);

        this.io = this.getPlugin("socket")(servers.staticServer, this.clientEvents, options, this.events);

        this.options = options;

        // get/emit the api
        this.api = api.getApi(ports, options, servers);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};