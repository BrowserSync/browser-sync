"use strict";

var prefixed = require("cl-strings").getCompiler("{green:[}BS{green:]}");
var compile  = require("cl-strings").compile;
var path     = require("path");
var multi    = require("multiline");
var objectPath = require("object-path");

var _        = require("lodash");
var utils    = require("./utils");

var messages = {
    /**
     * @param {Object} options
     * @param {Number} port
     * @returns {String}
     */
    scriptTags: function (port, options) {

        var template = "<script type=\"text/javascript\">//<![CDATA[";
        template    += "document.write(\"<script async src='%script'><\/script>\".replace(/HOST/g, location.hostname));";
        template    += "//]]></script>";

        var script = "//HOST:" + port + this.clientScript(options);

        if (options.tunnel) {
            script = this.clientScript(options);
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
        template    += "___browserSync___.io = window.io; try{delete window.io;}catch(err){window.io=undefined;};";
        template    += "___browserSync___.socketConfig = {}; ___browserSync___.socketConfig.path = '%path';";
        template    += "___browserSync___.socket = ___browserSync___.io(%url, ___browserSync___.socketConfig);";

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
        var template = prefix + "/browser-sync-client.{:version:}.js";

        if (!options || !options.version) {
            return script;
        }

        var params = {
            version: options.version
        };

        var compiled = compile(template, params);

        if (both) {
            return {
                path: script,
                versioned: compiled
            };
        }

        return compiled;
    },
    exit: function () {
        return compile("{cyan:Exiting...}");
    },
    tunnelFail: function (err) {
        return prefixed(["The following is a Tunnel error:", this.getErr(err)]);
    },
    configError: function (msg) {
        return prefixed("{red:CONFIG ERROR: %s }".replace("%s", msg));
    },
    getErr: function (msg) {
        return "{red:[ERROR] %s }".replace("%s", msg);
    },
    getDebug: function (msg) {
        return prefixed("{cyan:[DEBUG]: %s }".replace("%s", msg));
    },
    getPrefix: function (prefix) {

        var string = "";

        if (_.isString(prefix)) {
            string = "{green:[}%s{green:]} ".replace("%s", prefix);
        }

        return compile(string);
    },
    getNotifyPrefix: function (prefix) {

        var string = "";

        if (_.isString(prefix)) {
            string = "<span style='color: cyan'>%s</span>: ".replace("%s", prefix);
        }

        return string;
    },
    compile: compile
};

module.exports = messages;
