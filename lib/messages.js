"use strict";

var objectPath = require("object-path");
var _          = require("lodash");
var fs         = require("fs");
var config     = require("./config");

var messages = {
    /**
     * @param {Number} port
     * @param {Object} options
     * @returns {String}
     */
    scriptTags: function (port, options) {

        function getPath(relative, port) {
            return "//HOST:" + port + relative;
        }

        var template = fs.readFileSync(config.templates.scriptTag, "utf-8");

        var scriptPath = this.clientScript(options);
        var script;
        var override = false;

        if (options.scriptPath && _.isFunction(options.scriptPath)) {
            script   = options.scriptPath(scriptPath, port, options);
            override = true;
        } else {
            script = getPath(scriptPath, port);
        }

        if (!override && (options.server || options.proxy)) {
            script = scriptPath;
        }

        template = template
            .replace("%script%", script);

        return template;
    },
    /**
     * @param {String|Number} port
     * @param {Object} options
     * @returns {String}
     */
    socketConnector: function (port, options, external) {

        var path      = objectPath.get(options, "socket.path");
        var namespace = objectPath.get(options, "socket.namespace");
        var override  = false;
        var withPort = "location.hostname + ':%port+ns%'".replace("%port+ns%", port + namespace);

        if (_.isFunction(namespace)) {
            namespace = "'" + namespace(path, port, options) + "'";
            override = true;
        }

        if (!override) {
            // Ensure snippet mode always has PORT
            if (!options.server && !options.proxy || external) {
                namespace = withPort;
            } else {
                namespace = "'%ns'".replace("%ns", namespace);
            }
        }

        var template = fs.readFileSync(config.templates.connector, "utf-8");

        template = template
            .replace("%path%", path)
            .replace("%url%", namespace);

        return template;
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var prefix   = options.socket && options.socket.clientPath || "/browser-sync";
        var script   = prefix + "/browser-sync-client.js";
        var template = prefix + "/browser-sync-client.%s.js";

        var compiled = template.replace("%s", options.version);

        if (both) {
            return {
                path: script,
                versioned: compiled
            };
        }

        return compiled;
    }
};

module.exports = messages;
