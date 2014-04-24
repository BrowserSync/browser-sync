"use strict";

var controlPanel = require("./control-panel");
var messages = require("./messages");
var api = require("./api");
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

        this.io = this.getPlugin("socket")(ports.socket, this.clientEvents, options, this.events);

        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        utils.setUrlOptions(ports, options);

        // Start file watcher
        this.getPlugin("file:watcher")(files, options, this.events);

        // launch the server/proxy
        servers = this.initServer(options.host, ports, options, this.io);

        if (!servers) {
            this.events.emit("snippet", {ports: ports});
        }

        // Always Launch the control panel (which contains client script);
        var snippet   = messages.scriptTags(ports, options, "controlPanel");
        var connector = messages.socketConnector(ports.socket);

        var cpPlugin = this.getPlugin("controlpanel");
        var cp;

        if (cpPlugin) {
            cp = cpPlugin(options, snippet, connector, this);
        }

        controlPanel
            .launchControlPanel(options, this.getPlugin("client:script")(options, connector), cp)
            .listen(ports.controlPanel);

        this.options = options;

        // get/emit the api
        this.api = api.getApi(ports, options, servers);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};