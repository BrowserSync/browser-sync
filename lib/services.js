"use strict";

var controlPanel = require("./control-panel");
var messages     = require("./messages");
var api          = require("./api");
var utils        = require("./utils").utils;

module.exports.init = function (context) {

    return function (ports, files, options) {

        var servers;
        var msg;

        this.io = this.getPlugin("socket")(ports.socket, this.clientEvents, options, this.events);

        // register internal events
        this.registerInternalEvents(options);

        options.host = utils.xip(utils.getHostIp(options), options);

        // Start file watcher
        this.getPlugin("file:watcher")(files, options, this.events);

        // launch the server/proxy
        servers = this.initServer(options.host, ports, options, this.io);

        if (!servers) {
            this.events.emit("snippet", {ports: ports});
        }

        // Always Launch the control panel
        var scriptTags = messages.scriptTags(options.host, ports, options, "controlPanel");
        controlPanel.launchControlPanel(scriptTags, options, this.getPlugin("client:script")).listen(ports.controlPanel);

        this.options = options;

        // get/emit the api
        this.api = api.getApi(ports, options, servers);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};