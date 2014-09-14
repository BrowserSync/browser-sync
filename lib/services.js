"use strict";

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

        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        options.urls = utils.setUrlOptions(port, options);

        files = this.hook("files:watch", files);

        // Start file watcher
        this.watchers = this.getPlugin("file:watcher")(files, options, this.events);

        // Get the Client JS
        var clientJs = this.clientJs = this.hook("client:js", {port: port, options: options});

        // Start the server
        var server = this.server = this.initServer(
            options,
            this.getPlugin("client:script")(options, clientJs, options.proxy ? "file" : "middleware")
        );

        // Start the socket, needs an existing server.
        this.io = this.getPlugin("socket")(server, this);

        this.events.emit("init", this);

        this.initUserPlugins();

        this.callback(null, this);

    }.bind(context);
};