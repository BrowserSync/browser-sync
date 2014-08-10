"use strict";

var prefixed = require("cl-strings").getCompiler("{green:[}BS{green:]}");
var compile  = require("cl-strings").compile;
var path     = require("path");

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
     * @returns {String}
     */
    initProxy: function (options) {

        var output   = "";
        var target   = options.proxy.target;

        var templates = [
            "{green:Proxying:} {:proxy:}",
            "{green:Now you can access your site through the following addresses:}\n"
        ];

        output += prefixed(templates, {proxy: target});

        output += this.getUrls(options.urls);


        return output;
    },
    plugin: {
        error: function () {
            return "Your plugin must be a function";
        }
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
     * @param {Object} options
     * @param {Number} port
     * @returns {String}
     */
    scriptTags: function (port, options) {

        var template = [
            "\n<script type='text/javascript'>//<![CDATA[\n",
            "document.write(\"<script async src='{:custom:}'><\\/script>\".replace(/HOST/g, location.hostname));",
            "\n//]]></script>"
        ];

        var script = "//HOST:" + port + this.clientScript(options);

        if (options.tunnel) {
            script = this.clientScript(options);
        }

        var params = {
            custom: script
        };

        return compile(template.join("") + "\n", params);
    },
    host: {
        /**
         * Warn about possible problems with multi hosts
         * @returns {String}
         */
        multiple: function () {

            var template = [];
            template.push("Warning: Multiple External IP addresses found");
            template.push("If you have problems, you may need to manually set the 'host' option");

            return prefixed(template);
        }
    },
    /**
     * @returns {String}
     */
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";

        return prefixed(template);
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

            return prefixed(template, params);
        }
    },
    config: {
        /**
         * @param {String} filePath
         * @returns {String}
         */
        confirm: function (filePath) {
            var template1  = "Config file created ({cyan:{:path:}})";
            var template2  = "To use it, in the same directory run: {green:browser-sync start --config bs-config.js}";

            var params = {
                "path": path.basename(filePath)
            };

            return prefixed([template1, template2], params);
        }
    },
    files: {
        /**
         * @param {Array} [patterns]
         * @returns {String}
         */
        watching: function (patterns) {

            var string;
            if (Array.isArray(patterns) && patterns.length) {
                string = prefixed("{green:Watching files...}");
            } else {
                string = prefixed("{red:Not watching any files...}");
            }
            return string;
        },
        /**
         * @param {String} fileName
         * @returns {String}
         */
        changed: function (fileName) {
            var string = "{green:File Changed: }{magenta:{: path :}}";
            return prefixed(string, {
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
            return prefixed(string);
        },
        /**
         * @returns {String}
         */
        inject: function () {
            var string = "{cyan:Injecting file into all connected browsers...}";
            return prefixed(string);
        },
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
        var string = "var ___socket___ = io.connect(location.hostname + ':{:port:}');";
        var tunnel = "var ___socket___ = io.connect(location.hostname);";

        var template = options.tunnel ?
            tunnel : string;

        var params = {
            port: port
        };

        return compile(template, params);
    },
    /**
     * @param {Object} [options]
     * @param {Boolean} [both]
     */
    clientScript: function (options, both) {

        var script = "/browser-sync-client.js";
        var template = "/browser-sync-client.{:version:}.js";

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
    stream: {
        once: function () {
            return prefixed("{cyan:Reloading Browsers}");
        },
        multi: function (changed) {
            return prefixed("{cyan:Reloading {:count:} file{:s:} ({:files:})}", {
                count: changed.length,
                s: changed.length > 1 ? "s" : "",
                files: changed.join(", ")
            });
        }
    },
    proxyError: function () {
        return messages.getPrefixedError("Proxy address not reachable. Is your server running?");
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