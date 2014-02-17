"use strict";
var compileWithPrefix = require("cl-strings").getCompiler("{green:[}BS{green:]}");
var compile = require("cl-strings").compile;
var path = require("path");

module.exports = {
    /**
     * @param {String} hostIp
     * @param {String|Number} socketIoPort
     * @param {String|Number} scriptPort
     * @returns {String}
     */
    init: function (hostIp, ports, options) {

        var template = "{green:Copy the following snippet into your website, just before the closing} </body> {green:tag}\n\n{:tags:}";
        var params = {
            tags: this.scriptTags(hostIp, ports, options)
        };

        return compileWithPrefix(template, params);
    },
    server: {
        withProxy: function () {
            var template = "{red:Invalid config. You cannot specify both a server & proxy option.}";
            return compileWithPrefix(template);
        }
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @param {String} baseDir
     * @returns {String}
     */
    initServer: function (host, port, baseDir) {

        var output = "";

        var template = "{green:Server running. Use this URL:} {magenta:{: url :}}\n";
        output += compileWithPrefix(template, {
            url: this._makeUrl(host, port, "http:")
        });

        template = "{green:Serving files from:} {magenta:{: baseDir :}}";
        output += compileWithPrefix(template, {baseDir: baseDir});

        return output;
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @returns {String}
     */
    initProxy: function (host, port) {

        var template = "{green:Proxy running. Use this URL: }{magenta:{: url :}}";

        var params = {
            url: this._makeUrl(host, port, "http:")
        };

        return compileWithPrefix(template, params);
    },
    /**
     * Helper for creating a URL
     * @param {String} host
     * @param {String|Number} port
     * @param {String} [protocol]
     * @returns {String}
     */
    _makeUrl: function (host, port, protocol) {

        var string = "//{: host :}:{: port :}";

        if (protocol) {
            string = protocol + string;
        }

        return compile(string, {host: host, port: port});
    },
    /**
     * @param {String} hostIp
     * @param {Object} ports
     * @returns {String}
     */
    scriptTags: function (hostIp, ports, options, env) {

        var template = "<script src='{: socket :}'></script>\n";
        template    += "<script>{: connector :}</script>\n";
        template    += "<script src='{: custom :}'></script>\n";

        var socket = this._makeUrl(hostIp, ports.socket) + this.socketIoScript;
        var custom = this._makeUrl(hostIp, ports.controlPanel) + this.clientScript(options);

        if (env && env === "controlPanel") {
            custom = this._makeUrl(hostIp, ports.controlPanel) + this.controlPanel.jsFile;
        }

        var params = {
            socket: socket,
            custom: custom,
            connector: this.socketConnector(hostIp, ports.socket)
        };

        return compile(template, params);
    },
    host: {
        /**
         * Warn about possible problems with multi hosts
         * @param alternativeIp
         * @returns {*}
         */
        multiple: function () {

            var template = [];
            template.push("Warning: Multiple External IP addresses found");
            template.push("If you have problems, you may need to manually set the 'host' option");

            return compileWithPrefix(template);
        }
    },
    /**
     * @returns {String}
     */
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";

        return compileWithPrefix(template);
    },
    ports: {
        /**
         * @param {Number} minCount
         * @returns {String}
         */
        invalid: function (minCount) {
            var template = "{red:Invalid port range!} - At least {:minCount:} required!";
            var params   = {
                minCount: minCount
            };

            return compileWithPrefix(template, params);
        }
    },
    config: {
        /**
         * @param {String} path
         * @returns {String}
         */
        confirm: function (filePath) {
            var template1  = "Config file created ({cyan:{:path:}})";
            var template2  = "To use it, in the same directory run: {green:browser-sync}";

            var params = {
                "path": path.basename(filePath)
            };

            return compileWithPrefix([template1, template2], params);
        }
    },
    files: {
        /**
         * @param {Array} [patterns]
         * @param {Number} [patternLimit] - how many lines of patterns to show
         * @returns {String}
         */
        watching: function (patterns) {

            var string;
            if (Array.isArray(patterns) && patterns.length) {
                string = compileWithPrefix("{green:Watching files...}");
            } else {
                string = compileWithPrefix("{red:Not watching any files...}");
            }
            return string;
        },
        /**
         * @param {String} path
         * @returns {String}
         */
        changed: function (fileName) {
            var string = "{green:File Changed: }{magenta:{: path :}}";
            return compileWithPrefix(string, {
                path: path.basename(fileName)
            });
        }
    },
    browser: {
        /**
         * @returns {String}
         */
        reload: function () {
            var string = "{cyan:Reloading all connected browsers...}";
            return compileWithPrefix(string);
        },
        /**
         * @returns {String}
         */
        inject: function () {
            var string = "{cyan:Injecting file into all connected browsers...}";
            return compileWithPrefix(string);
        },
        /**
         * @param {Object} browser
         * @returns {String}
         */
        connection: function (browser) {

            var template = "{cyan:Browser Connected! ({:name:}, version: {:version:})}";
            var params = {
                name: browser.name,
                version: browser.version
            };

            return compileWithPrefix(template, params);
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
        return compileWithPrefix(template, params);
    },
    /**
     * @param {String} host
     * @param {String|Number} port
     * @returns {String}
     */
    socketConnector: function (host, port) {
        var string = "var ___socket___ = io.connect('{: url :}');";

        var params = {
            url: this._makeUrl(host, port, "http:")
        };

        return compile(string, params);
    },
    /**
     * @param {Object} [options]
     */
    clientScript: function (options, both) {

        var script = "/client/browser-sync-client.js";
        var template = "/client/browser-sync-client.{:version:}.js";

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
    /**
     *
     */
    controlPanel: {
        jsFile: "/js/app.js"
    },
    socketIoScript: "/socket.io/socket.io.js",
    configFile: "/bs-config.js",
    client: {
        shims: "/client/client-shims.js"
    }
};