"use strict";

var utils     = require("./utils");
var messages  = require("./messages");
var Immutable = require("immutable");

/**
 * @param context
 * @returns {function(this:*)}
 */
module.exports.init = function (context) {

    /**
     * @this {BrowserSync}
     */
    return function (options) {

        // register internal events
        this.registerInternalEvents(options);

        // Set global URL options
        this.setOption("urls", utils.setUrlOptions(options));

        var files = this.pluginManager.hook("files:watch", this, this.options.get("files").toJS());

        // Start file watcher
        this.watchers = this.pluginManager.get("file:watcher")(files, options, this.events);


        // Get the Client JS + any user-defined
        var clientJs = this.clientJs = this.pluginManager.hook("client:js", {
            port: options.get("port"),
            options: options
        });

        this.setOption("snippet", messages.scriptTags(options));
        this.setOption("scriptPaths", Immutable.fromJS(messages.clientScript(options, true)));

        // Start the server
        var server = this.server = this.pluginManager.get("server")(
            this,
            this.pluginManager.get("client:script")(options.toJS(), clientJs, options.get("proxy") ? "file" : "middleware")
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

        this.setOption("userPlugins", this.getUserPlugins());

        this.callback(null, this);

    }.bind(context);
};
