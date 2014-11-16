"use strict";

var utils        = require("./utils");

/**
 * @param context
 * @returns {function(this:*)}
 */
module.exports.init = function (context) {

    /**
     * @this {BrowserSync}
     */
    return function (options) {

        this.options = options;

        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        options.urls = utils.setUrlOptions(options.port, options);

        var files = this.pluginManager.hook("files:watch", this, options.files);

        // Start file watcher
        this.watchers = this.pluginManager.get("file:watcher")(files, options, this.events);

        // Get the Client JS + any user-defined
        var clientJs = this.clientJs = this.pluginManager.hook("client:js", {
            port: options.port,
            options: options
        });

        // Start the server
        var server = this.server = this.pluginManager.get("server")(
            this,
            this.pluginManager.get("client:script")(options, clientJs, options.proxy ? "file" : "middleware")
        );

        this.clientEvents = this.pluginManager.hook("client:events", this.clientEvents);

        // Start the socket, needs an existing server.
        this.io = this.pluginManager.get("socket")(
            server,
            this.clientEvents,
            this
        );

        this.events.emit("init", this);

        this.pluginManager.initUserPlugins(this);

        this.options.userPlugins = this.getUserPlugins();

        this.callback(null, this);

    }.bind(context);
};
