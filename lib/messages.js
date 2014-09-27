"use strict";

var objectPath = require("object-path");
var _        = require("lodash");

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

        var template = "\n<script type='text/javascript'>//<![CDATA[\n";
        template    += "document.write(\"<script async src='%script'><\\/script>\"" +
                       ".replace(/HOST/g, location.hostname)" +
                       ".replace(/PORT/g, location.port));";
        template    += "\n//]]></script>";

        var scriptPath = this.clientScript(options);
        var script;

        if (options.scriptPath && _.isFunction(options.scriptPath)) {
            script = options.scriptPath(scriptPath, port);
        } else {
            script = getPath(scriptPath, port);
        }

        if (options.tunnel) {
            script = scriptPath;
        }

        template = template
            .replace("%script", script);

        return template;
    },
    /**
     * @param {number} port
     * @param {Object} options
     * @returns {String}
     */
    socketConnector: function (port, options) {

        var path = objectPath.get(options, "socketConfig.path", "/browser-sync/socket.io");
        var namespace = objectPath.get(options, "socketConfig.namespace", "/browser-sync");

        // Ensure snippet mode always has PORT
        if (!options.server && !options.proxy) {
            namespace = "location.hostname + ':%port%ns'".replace("%port", port).replace("%ns", namespace);
        } else {
            namespace = "'%ns'".replace("%ns", namespace);
        }

        var template = "window.___browserSync___ = {};";
        template    += "___browserSync___.io = window.io; " +
                       "try{delete window.io;}catch(err){window.io=undefined;};";
        template    += "___browserSync___.socketConfig = {};" +
                       " ___browserSync___.socketConfig.path = '%path';";
        template    += "___browserSync___.socket = " +
                       "___browserSync___.io(%url, ___browserSync___.socketConfig);";

        template = template
            .replace("%path", path)
            .replace("%url", namespace);

        return template;
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var prefix = options.socket && options.socket.clientPath || "/browser-sync";
        var script = prefix + "/browser-sync-client.js";
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
