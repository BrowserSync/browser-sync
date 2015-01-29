"use strict";

var _          = require("lodash");
var fs         = require("fs");
var config     = require("./config");

var connectUtils = {
    /**
     * @param {Immutable.Map} options
     * @returns {String}
     */
    scriptTags: function (options) {

        function getPath(relative, port) {
            return "//HOST:" + port + relative;
        }

        var template = fs.readFileSync(config.templates.scriptTag, "utf-8");

        var scriptPath = this.clientScript(options);
        var script;
        var override = false;

        if (_.isFunction(options.get("scriptPath"))) {
            script   = options.get("scriptPath")(scriptPath, options.get("port"), options);
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
     * @param {String|Number} port
     * @param {Object} options
     * @param {Map} [bsOptions]
     * @param {Boolean} [external]
     * @returns {String}
     */
    socketConnector: function (port, options, bsOptions, external) {

        var path      = options.path;
        var namespace = options.namespace;
        var override  = false;
        var withHost = "location.host + '%ns%'".replace("%ns%", namespace);
        var withPort = "location.hostname + ':%ns%'".replace("%ns%", port + namespace);

        if (_.isFunction(namespace)) {
            namespace = "'" + namespace(path, port, options) + "'";
            override = true;
        }

        if (!override) {
            if (bsOptions) {
                // Ensure snippet mode always has PORT
                if (!bsOptions.get("server") && !bsOptions.get("proxy")) {
                    namespace = withPort;
                } else {
                    namespace = withHost;
                }
            }
            if (external) {
                namespace = withPort;
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

module.exports = connectUtils;
