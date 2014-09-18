"use strict";

var prefixed = require("cl-strings").getCompiler("{green:[}BS{green:]}");
var compile  = require("cl-strings").compile;
var path     = require("path");
var multi    = require("multiline");

var _        = require("lodash");
var utils    = require("./utils").utils;

var messages = {
    /**
     * @param {Object} port
     * @param {Object} options
     * @returns {String}
     */
    initSnippet: function (port, options) {

        var template = "{green:Copy the following snippet into your website, just before the closing} </body> {green:tag}\n{:tags:}";

        return prefixed(template, {
            tags: this.scriptTags(port, options)
        });
    },
    tunnel: function (url) {
        var templates = [
            "{green:Tunnel running...}",
            "{green:You can access it through the following address:}\n",
            ">>> {magenta:{:url:}}"
        ];

        return prefixed(templates, {url: url});
    },
    server: {
        /**
         * Conflicting options
         * @returns {String}
         */
        withProxy: function () {
            var template = "{red:Invalid config. You cannot specify both a server & proxy option.}";
            return prefixed(template);
        }
    },
    /**
     * @param {Object} options
     * @returns {String}
     */
    initServer: function (options) {

        var output = "";
        var baseDir = options.server ? options.server.baseDir : undefined;

        output += this.getUrls(options.urls);

        if (baseDir) {
            if (Array.isArray(baseDir)) {
                baseDir.forEach(addBase);
            } else {
                addBase(baseDir);
            }
        }

        function addBase (value) {
            output += prefixed("{green:Serving files from:} {magenta:{: baseDir :}}\n", {
                baseDir: value
            });
        }

        return output;
    },
    /**
     * @param {Object} options
     * @param {Number} port
     * @returns {String}
     */
    scriptTags: function (port, options) {

        var template = multi.stripIndent(function () {/*

         <script type="text/javascript">//<![CDATA[
         document.write("<script async src='%script'><\/script>".replace(/HOST/g, location.hostname));
         //]]></script>

         */});

        var script = "//HOST:" + port + this.clientScript(options);

        if (options.tunnel) {
            script = this.clientScript(options);
        }

        template = template
            .replace("%script", script);

        return template;
    },
    /**
     * @returns {String}
     */
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";
        return prefixed(template);
    },
    browser: {
        /**
         * @param {Object} browser
         * @param {Boolean} [prefixed]
         * @returns {String}
         */
        connection: function (browser, prefix) {

            var template = "{cyan:Browser Connected! ({:name:}, version: {:version:})}";
            var params = {
                name: browser.name,
                version: browser.version
            };

            if (!prefix) {
                return compile(template, params);
            }

            return prefixed(template, params);
        }
    },
    /**
     * @param {String} url
     * @returns {*}
     */
    location: function (url) {
        var template = "{green:Link clicked! Redirecting all browsers to }{magenta:{: url :}}";
        var params = {
            url: url
        };
        return prefixed(template, params);
    },
    /**
     * @param {number} port
     * @param {Object} options
     * @returns {String}
     */
    socketConnector: function (port, options) {

        var socketConfig = options.socket;
        var path = socketConfig && socketConfig.path || "/browser-sync/socket.io";
        var namespace = socketConfig && socketConfig.namespace || "/browser-sync";

        // Ensure snippet mode always has PORT
        if (!options.server && !options.proxy) {
            namespace = "location.hostname + ':%port%ns'".replace("%port", port).replace("%ns", namespace);
        } else {
            namespace = "'%ns'".replace("%ns", namespace);
        }

        var template = multi(function () {/*
         window.___browserSync___ = {};
         ___browserSync___.io = window.io; try{delete window.io;}catch(err){window.io=undefined;};
         ___browserSync___.socketConfig = {}; ___browserSync___.socketConfig.path = '%path';
         ___browserSync___.socket = ___browserSync___.io(%url, ___browserSync___.socketConfig);
        */});

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
    getUrls: function (urls) {
        var output = "";
        _.each(urls, function (value, key) {
            output += prefixed("{green:{:name:}:} >>> {magenta:{:url:}}\n", {
                name: utils.ucfirst(key),
                url: value
            });
        });
        return output;
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
    getPrefixedError: function (msg) {
        return prefixed("{red:[ERROR]} %s".replace("%s", msg));
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
