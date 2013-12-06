var clc = require("cli-color");
var _ = require("lodash");
var compile = require("./cli-strings.js").evalString;

module.exports = {
    connection: function (browser) {

        var template = "{cyan:Browser Connected! (<%= name %>, version: <%= version %>)}";
        var params = {
            name: browser.name,
            version: browser.version
        };

        return compile(template, params);

    },
    init: function (hostIp, socketIoPort, scriptPort) {

        var template = "\n\n{cyan:All Set Up!} Now copy & paste this snippet just before the closing </body> tag in your website.\n\n <%= tags %>";
        var params = {
            tags: this.scriptTags(hostIp, socketIoPort, scriptPort)
        };

        return compile(template, params);
    },
    initServer: function (hostIp, scriptPort, baseDir) {

        var template = "\n{green:OK, Server running at} {magenta:<%= url %>}";
        template    += "\n{green:Serving files from: } {magenta:<%= baseDir %>}";
        template    += "\n\n{green:Load a browser & check back here. If you set up everything correctly, you'll see a} {cyan:'Browser Connected'} {green: message}\n";
        var params = {
            url: this._makeUrl(hostIp, scriptPort),
            baseDir: baseDir
        };

        return compile(template, params);
    },
    /**
     * @param {String} host
     * @param {Number} proxyPort
     * @returns {Object}
     */
    initProxy: function (host, proxyPort) {

        var template = "{green:Proxy running. Use this URL: }{magenta:<%= url %>}";

        var params = {
            url: this._makeUrl(host, proxyPort)
        };

        return compile(template, params);
    },
    /**
     * Helper for creating a URL
     * @param host
     * @param port
     * @returns {string}
     */
    _makeUrl: function (host, port) {

        var string = "http://<%= host %>:<%= port %>";

        return _.template(string)({host: host, port: port});
    },

    scriptTags: function (hostIp, socketIoPort, scriptPort) {

        var template = "<script src='<%= url1 %>'></script>\n<script src='<%= url2 %>'></script>\n\n";
        var params = {
            url1: this._makeUrl(hostIp, socketIoPort) + this.socketIoScript,
            url2: this._makeUrl(hostIp, scriptPort) + this.clientScript
        };

        return compile(template, params);

    },
    invalidBaseDir: function () {

        var template = "{cyan:Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )}";

        return compile(template, {});

    },
    fileWatching: function (patterns) {

        var string;

        if (Array.isArray(patterns) && patterns.length) {

            string = compile("{green:Watching the following:}\n");

            var limit = 10;
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
    fileChanged: function (path) {
        var string = "{magenta:File Changed: }{green:<%= path %>}";
        return compile(string, {path: path});
    },
    browser: {
        reload: function () {
            var string = "{cyan:Reloading all connected browsers...}";
            return compile(string);
        },
        inject: function () {
            var string = "{cyan:Injecting file into all connected browsers...}";
            return compile(string);
        }
    },
    location: function (url) {
        var template = "{yellow:Link clicked! Redirecting all browser to }{green:<%= url %>}";
        var params = {
            url: url
        };
        return compile(template, params);
    },
    socketConnector: function (host, port) {
        var string = "var ___socket___ = io.connect('<%= url %>');";

        var params = {
            url: this._makeUrl(host, port)
        };

        var compiled = compile(string, params);

        return compiled;

    },
    clientScript: "/browser-sync-client.min.js",
    socketIoScript: "/socket.io/socket.io.js"
};