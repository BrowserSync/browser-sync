"use strict";

var portScanner = require("portscanner");
var gaze = require("gaze");
var _ = require("lodash");
var fs = require("fs");
var filePath = require("path");
var connect = require("connect");
var http = require("http");
var devIp = require("dev-ip");
var UAParser = require("ua-parser-js");

var messages = require("./messages");
var loadSnippet = require("./loadSnippet");
var createProxy = require("./dev-proxy");
var parser = new UAParser();

var browserSync = function () {};
var cwd = process.cwd();

var io;

browserSync.prototype = {
    cwd: cwd,
    options: {
        injectFileTypes: ["css", "png", "jpg", "jpeg", "svg", "gif"],
        minPorts: 3
    },
    /**
     * @param {Array} files
     * @param {Object} options
     */
    init: function (files, options) {

        this.userOptions = options;

        var _this   = this, iolocal, handles, server, watcher, minPorts = this.options.minPorts;

        var portRange = this.getPortRange(minPorts, options);

        if (portRange) {

            this.getPorts(minPorts, function (ports) {

                // setup Socket.io
                iolocal = _this.setupSocket(ports);

                // Set up event callbacks
                handles = _this.handleSocketConnection(_this.callbacks, options, _this.handleClientSocketEvent);

                // launch the server
                server = _this.launchServer(_this.getHostIp(options, devIp.getIp(null)), ports, options);

                // Watch files
                watcher = _this.watchFiles(files, io, _this.changeFile, options);

            }, portRange.min, portRange.max);

        } else {
            this.fail(messages.ports.invalid(minPorts), options, true);
        }
    },
    /**
     * @param {Number} minCount
     * @param {Object} options
     */
    getPortRange: function (minCount, options) {

        var ports = options.ports;

        if (ports) {
            if (ports.min && ports.max) {
                if ((ports.max - ports.min + 1) < minCount) {
                    return false;
                }
                return {
                    min: ports.min,
                    max: ports.max
                };
            }
            if (ports.min) {
                var max = ports.min + 500;
                return {
                    min: ports.min,
                    max: max < 10000 ? max : 9999
                };
            }
        }

        return {
            min: 3000,
            max: 4000
        };
    },
    /**
     * Get two available Ports
     * @param {Number} limit
     * @param {Function} callback
     * @param {Number} [min]
     * @param {Number} [max]
     */
    getPorts: function (limit, callback, min, max) {

        var ports = [];

        var lastFound = min - 1 || 2999;

        // get a port (async)
        var getPort = function () {
            portScanner.findAPortNotInUse(lastFound + 1, max || 4000, "localhost", function (error, port) {
                ports.push(port);
                lastFound = port;
                runAgain();
            });
        };

        // run again if number of ports not reached
        var runAgain = function () {
            if (ports.length < limit) {
                getPort();
            } else {
                return callback(ports);
            }
            return false;
        };

        // Get the first port
        getPort();

    },
    /**
     * Set up the socket.io server
     * @param {Array} ports
     * @returns {Socket}
     */
    setupSocket: function (ports) {

        io = require("socket.io").listen(ports[0]);
        io.set("log level", 0);

        return io;
    },
    /**
     * Things to do when a client connects
     * @param {Array} events
     * @param {Object} userOptions
     * @param {function} handle
     */
    handleSocketConnection: function (events, userOptions, handle) {

        var _this = this;
        var ua;
        io.sockets.on("connection", function (client) {

            // set ghostmode callbacks
            if (userOptions.ghostMode) {
                for (var i = 0, n = events.length; i < n; i += 1) {
                    handle(client, events[i], userOptions, _this);
                }
            }

            client.emit("connection", userOptions);

            ua = client.handshake.headers["user-agent"];

            _this.logConnection(ua, userOptions);
        });
    },
    /**
     * Add a client event & it's callback
     * @param {Object} client
     * @param {String} event
     * @param {Object} userOptions
     */
    handleClientSocketEvent: function (client, event, userOptions, _this) {
        client.on(event.name, function (data) {
            event.callback(client, data, _this);
        });
    },
    /**
     * Kill the current socket IO server
     */
    killSocket: function () {
        return io.server.close();
    },
    /**
     * Log a successful client connection
     * @param {Object} ua
     * @param {Object} userOptions
     */
    logConnection: function (ua, userOptions) {
        this.log(messages.browser.connection(parser.setUA(ua).getBrowser()), userOptions, true);
    },
    /**
     * ghostMode Callbacks (responses to client events)
     */
    callbacks: [
        {
            name: "scroll",
            callback: function (client, data) {
                client.broadcast.emit("scroll:update", { position: data.pos, ghostId: data.ghostId, url: data.url});
            }
        },
        {
            name: "location",
            callback: function (client, data, context) {
                context.log(messages.location(data.url), context.userOptions, false);
                client.broadcast.emit("location:update", { url: data.url });
            }
        },
        {
            name: "input:type",
            callback: function (client, data) {
                client.broadcast.emit("input:update", { id: data.id, value: data.value });
            }
        },
        {
            name: "input:select",
            callback: function (client, data) {
                client.broadcast.emit("input:update", { id: data.id, value: data.value });
            }
        },
        {
            name: "input:radio",
            callback: function (client, data) {
                client.broadcast.emit("input:update:radio", { id: data.id, value: data.value });
            }
        },
        {
            name: "input:checkbox",
            callback: function (client, data) {
                client.broadcast.emit("input:update:checkbox", { id: data.id, checked: data.checked });
            }
        },
        {
            name: "form:submit",
            callback: function (client, data) {
                client.broadcast.emit("form:submit", { id: data.id });
            }
        },
        {
            name: "form:reset",
            callback: function (client, data) {
                client.broadcast.emit("form:submit", { id: data.id });
            }
        }
    ],
    /**
     * Helper to try to retrieve the correct external IP for host
     * Defaults to localhost (0.0.0.0) if no network ip's are accessible.
     * @param {Object} options
     * @param {String} [devIp]
     * @returns {String} - the IP address
     */
    getHostIp: function (options, devIp) {

        var fallback  = "0.0.0.0";

        if (options) {
            if (options.host) {
                return options.host;
            }
            if (options.detect === false || !devIp) {
                return fallback;
            }
        }

        return devIp || fallback;
    },
    /**
     * Take the path provided in options & transform into CWD for serving files
     * @param {String} [baseDir]
     * @returns {String}
     */
    getBaseDir: function (baseDir) {

        var suffix = "";

        if (!baseDir || baseDir === "./" || baseDir === "/" || baseDir === ".") {
            return process.cwd();
        } else {
            if (baseDir[0] === "/") {
                suffix = baseDir;
            } else {
                if (baseDir[0] === "." && baseDir[1] === "/") {
                    suffix = baseDir.replace(".", "");
                } else {
                    suffix = "/" + baseDir;
                }
            }
        }

        return process.cwd() + suffix;
    },
    /**
     * Expose messages for tests
     * @returns {*|exports}
     */
    getMessages: function () {
        return messages;
    },
    /**
     * Log a message to the console
     * @param {String} msg
     * @param {Object} options
     * @param {boolean} override
     * @returns {boolean}
     */
    log: function (msg, options, override) {

        if (!options.debugInfo && !override) {
            return false;
        }

        return console.log(msg);
    },
    /**
     * @param {String} msg
     * @param {Object} options
     * @param {Boolean} kill
     */
    fail: function (msg, options, kill) {
        this.log(msg, options, true);
        if (kill) {
            process.exit(1);
        }
    },
    /**
     * @param {String} path
     * @param {socket} io
     * @param {Object} options
     * @param _this - context
     * @returns {{assetFileName: String}}
     */
    changeFile: function (path, io, options, _this) {

        var fileName = filePath.basename(path);
        var fileExtension = _this.getFileExtension(path);

        var data = {
            assetFileName: fileName,
            fileExtension: fileExtension
        };

        var message = "inject";

        // RELOAD page
        if (!_.contains(options.injectFileTypes, fileExtension)) {
            data.url = path;
            message = "reload";
        }

        // emit the event through socket
        io.sockets.emit("reload", data);

        // log the message to the console
        _this.log(messages.files.changed(_this.resolveRelativeFilePath(path, _this.cwd)), options, false);
        _this.log(messages.browser[message](), options, false);

        return data;
    },
    /**
     * Append the socket connector
     * @param {String} host
     * @param {Number} port
     * @returns {Function}
     */
    modifySnippet: function (host, port) {

        var connector = messages.socketConnector(host, port);
        var jsFile    = fs.readFileSync(__dirname + messages.clientScript, "UTF-8");
        var result    = connector + jsFile;

        return function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(result);
        };
    },
    /**
     * Launch the server for serving the client JS plus static files
     * @param {String} host
     * @param {Array} ports
     * @param {Object} options
     * @returns {*|http.Server}
     */
    launchServer: function (host, ports, options) {

        var proxy  = options.proxy || null;
        var server = options.server || null;
        var app, modifySnippet = this.modifySnippet(host, ports[0]);
        var staticServer, msg, proxyServer;

        // Serve the JS file manually for anything that doesn't use a server.
        if (!options.server) {
            app = connect().use(messages.clientScript, modifySnippet);
        }

        if (proxy) {
            proxyServer = createProxy(host, ports, options);
        } else {

            var baseDir = options.server.baseDir || "./";
            var index = options.server.index || "index.html";

            app = connect()
                    .use(messages.clientScript, modifySnippet)
                    .use(loadSnippet(host, ports[0], ports[1]))
                    .use(connect.static(filePath.resolve(baseDir), {index: index}));
        }

        // Launch the server
        staticServer = http.createServer(app).listen(ports[1]);

        if (server && !proxy) {
            msg = messages.initServer(host, ports[1], this.getBaseDir(options.server.baseDir || "./"));
            this.openBrowser(host, ports[1], options);
        }

        if (proxy && !server) {
            msg = messages.initProxy(host, ports[2]);
            this.openBrowser(host, ports[2], options);
        }

        if (!options.server && !proxy) {
            msg = messages.init(host, ports[0], ports[1]);
        }

        this.log(msg, options, true);

        return {
            staticServer : staticServer,
            proxyServer  : proxyServer
        };
    },
    /**
     * Open the page in browser
     * @param host
     * @param port
     * @param options
     */
    openBrowser: function (host, port, options) {
        if (options.open) {
            var open = require("open");
            open("http://" + host + ":" + port);
        }
    },
    /**
     * Proxy for gaze file watching
     * @param {Array|String} files
     * @param {socket} io
     * @param {Function} callback
     * @param {Number} [timeout] - time between changes
     * @param {Object} options
     */
    watchFiles: function (files, io, callback, options, timeout) {

        var _this = this, log = this.log, lastInjected = { time: new Date().getTime() };

        gaze(files, function(err, watcher) {

            var key = Object.keys(this.watched())[0];

            if (key) {
                log(messages.files.watching(watcher._patterns), options, true);
            } else {
                log(messages.files.watching(), options, true);
            }

            // On file changed
            this.on("changed", function(filepath) {
                var stats = fs.statSync(filepath);
                if (stats.size === 0) {
                    var count = 0;
                    var writeCheck = setInterval(function () {

                        if (count > 4000) {
                            clearInterval(writeCheck);
                            return;
                        }
                        count += 200;

                        if (fs.statSync(filepath).size > 0) {

                            lastInjected.time = new Date().getTime();
                            lastInjected.file = filepath;

                            callback(filepath, io, options, _this);
                            clearInterval(writeCheck);

                            return;
                        }

                    }, 200);
                } else {

                    if (new Date().getTime() > lastInjected.time + (timeout || 2000)) {
                        callback(filepath, io, options, _this);
                    }

                    lastInjected.time = new Date().getTime();
                    lastInjected.file = filepath;
                }
            });
        });
    },
    /**
     * @param filepath
     * @param cwd
     * @returns {*|XML|string|void}
     */
    resolveRelativeFilePath: function (filepath, cwd) {
        return filepath.replace(cwd + "/", "");
    },
    /**
     * @param {String} path
     * @returns {String}
     */
    getFileExtension: function (path) {
        return filePath.extname(path).replace(".", "");
    }
};

module.exports = browserSync;