var compile = require("cl-strings").compile;


var utils = {
    /**
     * Helper for creating a URL
     * @param {String} host
     * @param {String|Number} port
     * @returns {String}
     */
    makeUrl: function (host, port) {

        var string = "http://{: host :}:{: port :}";

        return compile(string, {host: host, port: port});
    }
};

/**
 * Urls used
 * @type {{clientScript: string, socketIoScript: string, controlPanelScript: string}}
 */
var urls = {
    clientScript: "/browser-sync-client.min.js",
    socketIoScript: "/socket.io/socket.io.js",
    controlPanelScript: "/js/app.js"
};

module.exports = {
    /**
     * @param {String} hostIp
     * @param {String|Number} socketIoPort
     * @param {String|Number} scriptPort
     * @returns {String}
     */
    init: function (hostIp, socketIoPort, scriptPort) {

        var template = "\n\n{cyan:All Set Up!} Now copy & paste this snippet just before the closing </body> tag in your website.\n\n {: tags :}";
        var params = {
            tags: this.snippets.client(hostIp, socketIoPort, scriptPort)
        };

        return compile(template, params);
    },
    /**
     * @param {String} hostIp
     * @param {String|Number} scriptPort
     * @param {String} baseDir
     * @returns {String}
     */
    initServer: function (hostIp, scriptPort, baseDir) {

        var template = "\n{green:OK, Server running at} {magenta:{: url :}}";
        template    += "\n{green:Serving files from:} {magenta:{: baseDir :}}";
        template    += "\n\n{green:Load a browser & check back here. If you set up everything correctly, you'll see a} {cyan:'Browser Connected'} {green:message}\n";
        var params = {
            url: utils.makeUrl(hostIp, scriptPort),
            baseDir: baseDir
        };

        return compile(template, params);
    },
    /**
     * @param {String} host
     * @param {String|Number} proxyPort
     * @returns {String}
     */
    initProxy: function (host, proxyPort) {

        var template = "{green:Proxy running. Use this URL: }{magenta:{: url :}}";

        var params = {
            url: utils.makeUrl(host, proxyPort)
        };

        return compile(template, params);
    },
    snippets: {
        /**
         * @param {String} hostIp
         * @param {String|Number} socketIoPort
         * @param {String|Number} scriptPort
         * @returns {String}
         */
        client: function (hostIp, socketIoPort, scriptPort) {
            var template = "<script src='{: url1 :}'></script>\n<script src='{: url2 :}'></script>\n\n";
            var params = {
                url1: utils.makeUrl(hostIp, socketIoPort) + urls.socketIoScript,
                url2: utils.makeUrl(hostIp, scriptPort) + urls.clientScript
            };

            return compile(template, params);
        },
        /**
         * @param {String} hostIp
         * @param {String|Number} socketIoPort
         * @param {String|Number} scriptPort
         * @returns {String}
         */
        controlPanel: function (hostIp, socketIoPort, scriptPort) {
            var template = "<script src='{: url1 :}'></script>\n<script src='{: url2 :}'></script>\n\n";
            var params = {
                url1: utils.makeUrl(hostIp, socketIoPort) + urls.socketIoScript,
                url2: utils.makeUrl(hostIp, scriptPort) + urls.controlPanelScript
            };

            return compile(template, params);
        }
    },
    /**
     * @returns {String}
     */
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";

        return compile(template, {});
    },
    files: {
        /**
         * @param {Array} [patterns]
         * @param {Number} [patternLimit] - how many lines of patterns to show
         * @returns {String}
         */
        watching: function (patterns, patternLimit) {

            var string, limit = patternLimit || 10;

            if (Array.isArray(patterns) && patterns.length) {

                string = compile("{green:Watching the following:}\n");

                var slice = patterns.slice(0, limit);

                slice.forEach(function (item) {
                    string += item.replace(" ", "") + "\n";
                });

                if (patterns.length > limit) {
                    string += "Plus more...\n";
                }

            } else {
                string = compile("{red:Not watching any files...}");
            }

            return string;
        },
        /**
         * @param {String} path
         * @returns {String}
         */
        changed: function (path) {
            var string = "{magenta:File Changed: }{green:{: path :}}";
            return compile(string, {path: path});
        }
    },
    browser: {
        /**
         * @returns {String}
         */
        reload: function () {
            var string = "{cyan:Reloading all connected browsers...}";
            return compile(string);
        },
        /**
         * @returns {String}
         */
        inject: function () {
            var string = "{cyan:Injecting file into all connected browsers...}";
            return compile(string);
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

            return compile(template, params);
        }
    },
    /**
     * @param {String} url
     * @returns {*}
     */
    location: function (url) {
        var template = "{yellow:Link clicked! Redirecting all browsers to }{green:{: url :}}";
        var params = {
            url: url
        };
        return compile(template, params);
    },
    socketConnector: function (host, port) {
        var string = "var ___socket___ = io.connect('{: url :}');";

        var params = {
            url: utils.makeUrl(host, port)
        };

        return compile(string, params);
    },
    urls: urls,
    utils: utils
};