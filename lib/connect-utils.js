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
        var async = options.getIn(["snippetOptions", "async"]);
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
            .replace("%script%", script)
            .replace("%async%", async ? "async" : "");

        return template;
    },
    /**
     * @param {Map} options
     * @returns {String}
     */
    socketConnector: function (options) {

        var socket        = options.get("socket");
        var template      = fs.readFileSync(config.templates.connector, "utf-8");
        var url           = connectUtils.getConnectionUrl(options);

        template = template
            .replace("%path%", socket.get("path"))
            .replace("%url%",  url);

        return template;
    },
    /**
     * @param {Object} socketOpts
     * @param {Map} options
     * @returns {String|Function}
     */
    getNamespace: function (socketOpts, options) {

        var namespace = socketOpts.namespace;

        if (typeof namespace === "function") {
            return namespace(options);
        }

        if (!namespace.match(/^\//)) {
            namespace = "/" + namespace;
        }

        return namespace;
    },
    /**
     * @param {Map} options
     * @returns {string}
     */
    getConnectionUrl: function (options) {

        var socketOpts       = options.get("socket").toJS();
        var namespace        = connectUtils.getNamespace(socketOpts, options);

        var protocol         = "";
        var withHostnamePort = "'{protocol}' + location.hostname + ':{port}{ns}'";
        var withHost         = "'{protocol}' + location.host + '{ns}'";
        var withDomain       = "'{domain}{ns}'";

        // default use-case is server/proxy
        var string           = withHost;

        if (options.get("mode") === "snippet") {
            protocol = options.get("scheme") + "://";
            string   = withHostnamePort;
        }

        if (socketOpts.domain) {
            string = withDomain;
            if (typeof socketOpts.domain === "function") {
                socketOpts.domain = socketOpts.domain.call(null, options);
            }
        }

        return string
            .replace("{protocol}", protocol)
            .replace("{port}",     options.get("port"))
            .replace("{domain}",   socketOpts.domain)
            .replace("{ns}",       namespace);
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var prefix   = options.getIn(["socket", "clientPath"]);
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
