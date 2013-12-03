var clc = require("cli-color");
var _ = require("lodash");
var template = _.template;


// _todo - Make string outputs nicer with underscore templates
module.exports = {
    connection: function (browser) {
        return clc.cyan("Browser Connected! (" + browser.name + ", version: " + browser.version + ")");
    },
    init: function (hostIp, socketIoPort, scriptPort) {
        return clc.yellow('\n\nAll Set Up! Now copy & paste this snippet just before the closing </body> tag in your website.\n\n') +
                this.scriptTags(hostIp, socketIoPort, scriptPort, false);
    },
    initServer: function (hostIp, scriptPort, baseDir) {

        return clc.green("\nOK, Server running at ") + clc.magenta("http://" + hostIp + ":" + scriptPort + "\n\n") +
                clc.green("Serving files from: ") + clc.magenta(baseDir) + "\n\n" +
                clc.green("Go load a browser & check back here. If you set up everthing correctly, you'll see a " +
                        "'Browser Connected' message.\n");
    },
    /**
     * @param {String} host
     * @param {Number} proxyPort
     * @returns {Object}
     */
    initProxy: function (host, proxyPort) {

        var template = "#c:green#Proxy running. Use this URL: ##c:magenta#<%= url %>#";

        return this.evalString(template, {url: this._makeUrl(host, proxyPort)});
    },
    /**
     * Compile string, run through underscore, add colors and return;
     * @param template
     * @param params
     * @returns {Object}
     */
    evalString: function (template, params) {
        var compiled = this.compile(template, params);

        if (compiled.indexOf("clc.") !== -1) {
            return eval(compiled);
        } else {
            return compiled;
        }
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

        return this.evalString(template, {
            url1: this._makeUrl(hostIp, socketIoPort) + this.socketIoScript,
            url2: this._makeUrl(hostIp, scriptPort) + this.clientScript
        });

    },
    invalidBaseDir: function () {
        return clc.cyan("Invalid Base Directory path for server. ( baseDir: )\n\n") +
                clc.green("TIP: Don't use a forward slash at the beginning, and if you " +
                        "want to serve files from the root folder, just set the baseDir option to './' ");
    },
    fileWatching: function (patterns) {

        var string;

        if (Array.isArray(patterns) && patterns.length) {

            string = clc.cyan("Watching the following:\n");

            var limit = 10;
            var slice = patterns.slice(0, limit);

            slice.forEach(function (item) {
                string += item.replace(" ", "") + "\n";
            });

            if (patterns.length > limit) {
                string += "Plus more...\n";
            }

        } else {
            string = "Not watching anything...";
        }

        return string;
    },
    compileColors: function (templateString) {

        var regex = new RegExp("(#c:[a-z]{2,10}[^#]#)(.*?)(?=#)", "g");

        var string = "";

        var matches = templateString.match(regex);

        if (!matches) {
            return templateString;
        }

        for (var n = 1; n < 5; n += 1) {
            var item = regex.exec(templateString);

            var lastChar = n == matches.length ? ";" : " + ";

            if (item) {
                string += item[1]
                        .replace(/#c:(.+)#/, "clc.$1('") + item[2] + "')" + lastChar;

            } else {
                break;
            }
        }
        return string;

    },
    compile: function (string, params) {
        var template = _.template(string)(params);
        var colors = this.compileColors(template);
        console.log(colors);
        return colors;
    },
    fileChanged: function (path) {
        return clc.magenta("File Changed: " + clc.green(path));
    },
    browser: {
        reload: function () {
            return clc.yellow("Reloading all connected browsers...");
        },
        inject: function () {
            return clc.yellow("Injecting file into all connected browsers...");
        }
    },
    location: function (url) {
        return clc.yellow("Link clicked! Redirecting all browser to " + clc.green(url));
    },
    socketConnector: function (host, port) {
        return "var ___socket___ = io.connect('" + host + ":" + port + "');";
    },
    clientScript: "/browser-sync-client.min.js",
    socketIoScript: "/socket.io/socket.io.js"
};