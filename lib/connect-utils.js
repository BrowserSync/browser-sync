"use strict";

var _             = require("lodash");
var fs            = require("fs");
var config        = require("./config");

var connectUtils = {
    /**
     * @param {Immutable.Map} options
     * @returns {String}
     */
    scriptTags: function (options) {

        function getPath(relative, port) {
            if (options.get("mode") === "snippet") {
                return options.get("scheme") + "://HOST:" + port + relative;
            } else {
                return "//HOST:" + port + relative;
            }
        }

        var template = fs.readFileSync(config.templates.scriptTag, "utf-8");

        var scriptPath = this.clientScript(options);
        var script;
        var override = false;

        if (_.isFunction(options.get("scriptPath"))) {
            var args = getScriptArgs(options, scriptPath);
            script   = options.get("scriptPath").apply(null, args);
            override = true;
        } else {
            script = getPath(scriptPath, options.get("port"));
        }

        if (!override && (options.get("server") || options.get("proxy"))) {
            script = scriptPath;
        }

        template = template
            .replace("%script%", script);

        return template;
    },
    /**
     * @param {Map} options
     * @returns {String}
     */
    socketConnector: function (options) {

        var socket        = options.get("socket");
        var template      = fs.readFileSync(config.templates.connector, "utf-8");
        var connectionUrl = require("url").parse(socket.get("namespace"));
        var url           = connectUtils.getConnectionUrl(options);

        /**
         * If namespace is a URL, just return it
         */
        if (connectionUrl.host && connectionUrl.protocol) {
            url = "'%s'".replace("%s", socket.get("namespace"));
        }

        template = template
            .replace("%path%", socket.get("path"))
            .replace("%url%",  url);

        return template;
    },
    getConnectionUrl: function (options) {

        var protocol   = "";
        var string     = "'%protocol%' + location.%host% + '%ns%'";
        var socketOpts = connectUtils.resolveSocketOptions(options);

        if (options.get("mode") === "snippet") {
            protocol = options.get("scheme") + "://";
        }

        return string
            .replace("%protocol%", protocol)
            .replace("%host%",     socketOpts.host)
            .replace("%ns%",       socketOpts.namespace);
    },
    /**
     * @param options
     * @returns {{host: string, namespace: string}}
     */
    resolveSocketOptions: function (options) {

        var socket    = options.get("socket");
        var namespace = socket.get("namespace");
        var external  = options.get("mode") === "snippet";

        return {
            host: external
                      ? "hostname"
                      : "host",
            namespace: (function (external) {

                return external
                    ? [":", options.get("port"), namespace].join("")
                    : namespace;

            })(external)
        };
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var prefix   = options.getIn(["socket", "clientPath"]) || "/browser-sync";
        var script   = prefix + "/browser-sync-client.js";
        var template = prefix + "/browser-sync-client.%s.js";

        var compiled = template.replace("%s", options.get("version"));

        if (both) {
            return {
                path: script,
                versioned: compiled
            };
        }

        return compiled;
    }
};

/**
 * @param options
 * @returns {*[]}
 */
function getScriptArgs (options, scriptPath) {
    var abspath = options.get("scheme") + "://HOST:" + options.get("port") + scriptPath;
    return [
        scriptPath,
        options.get("port"),
        options.set("absolute", abspath)
    ];
}

module.exports = connectUtils;
