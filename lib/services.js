"use strict";

var utils        = require("./utils").utils;
var snippetUtils = require("./snippet").utils;

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

        // Start file watcher
        this._watcher = this.getPlugin("file:watcher")(files, options, this.events);

        // Get the Client JS
        var clientJs = snippetUtils.getClientJs(port, options);

        // Start the server
        var server = this.server = this.initServer(
            options.host,
            port,
            options,
            this.getPlugin("client:script")(options, clientJs, options.proxy ? "file" : "middleware")
        );

        // Start the socket, needs an existing server.
        this.io = this.getPlugin("socket")(server, this);

        this.events.emit("init", this);

        this.callback(null, this);

    }.bind(context);
};