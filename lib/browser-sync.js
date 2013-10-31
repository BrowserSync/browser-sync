var portScanner = require('portscanner');
var chokidar = require('chokidar');
var _ = require("lodash");
var fs = require("fs");
var filePath = require("path");
var connect = require("connect");
var http = require("http");
var UAParser = require('ua-parser-js');
var messages = require('./messages');
var loadSnippet = require('./loadSnippet');
var devIp = require('dev-ip');

var parser = new UAParser();
var options;

var scriptData = fs.readFileSync(__dirname + messages.clientScript, "UTF-8");

var browserSync = function () {};

browserSync.prototype = {
    options: {
        injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif']

    },
    init: function (files, options) {

        this.userOptions = options;

        var _this = this, io, handles, server, watcher;

        this.getPorts(2, function (ports) {

            // setup Socket.io
            io = _this.setupSocket(ports);

            // Set up event callbacks
            handles = _this.handleSocketConnection(_this.callbacks, options, _this.handleClientSocketEvent);

            // launch the server
            server = _this.launchServer(_this.getHostIp(options), ports, options);

            // Watch files
            watcher = _this.watchFiles(files, io, _this.changeFile, options);

        }, options);
    },
    /**
     * Get two available Ports
     * @param {number} limit
     * @param {function} callback
     * @param options
     */
    getPorts: function (limit, callback, options) {

        var ports = [];

        // get a port (async)
        var getPort = function (start) {
            portScanner.findAPortNotInUse(start + 1, 4000, 'localhost', function (error, port) {
                ports.push(port);
                runAgain();
            });
        };

        // run again if number of ports not reached
        var runAgain = function () {
            if (ports.length < limit) {
                getPort(ports[0]);
            } else {
                return callback(ports);
            }
            return false;
        };

        // Get the first port
        getPort(2999);

    },
    /**
     * Set up the socket.io server
     * @param {Array} ports
     * @param {object} userOptions
     * @returns {Socket}
     */
    setupSocket: function (ports) {

        io = require('socket.io').listen(ports[0]);
        io.set('log level', 0);

        return io;
    },
    /**
     * Things to do when a client connects
     * @param {Array} events
     * @param {object} userOptions
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

            ua = client.handshake.headers['user-agent'];

            _this.logConnection(ua, userOptions);
        });
    },
    /**
     * Add a client event & it's callback
     * @param {object} client
     * @param {string} event
     * @param {object} userOptions
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
     * @param {object} ua
     * @param {object} userOptions
     */
    logConnection: function (ua, userOptions) {
        this.log(messages.connection(parser.setUA(ua).getBrowser()), userOptions, true);
    },
    /**
     * ghostMode Callbacks (responses to client events)
     */
    callbacks: [
        { name: "scroll", callback: function (client, data) {
            client.broadcast.emit("scroll:update", { position: data.pos, ghostId: data.ghostId, url: data.url});
        }},
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
     * Defaults to localhost if no network ip's are accessible.
     * @param {object} options
     * @returns {string} - the IP address
     */
    getHostIp: function (options) {

        var externalIp = "0.0.0.0"; // default

        if (options) {
            if (options.host) {
                return options.host;
            }
            if (options.detect === false) {
                return externalIp;
            }
        }

        return devIp.getIp() || externalIp;
    },
    /**
     * Take the path provided in options & transform into CWD for serving files
     * @param {string} baseDir
     * @returns {string}
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
     * @param {string} msg
     * @param {object} options
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
     * @param {string} path
     * @param {socket} io
     * @param {object} options
     * @param _this - context
     * @returns {{assetFileName: string}}
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
        _this.log(messages.fileChanged(path), options, false);
        _this.log(messages.browser[message](), options, false);

        return data;
    },
    /**
     * Launch the server for serving the client JS plus static files
     * @param {String} host
     * @param {Array} ports
     * @param {Object} options
     * @returns {*|http.Server}
     */
    launchServer: function (host, ports, options) {

        var modifySnippet = function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(messages.socketConnector(host, ports[0]) + scriptData);
        };

        var app;
        if (!options.server) {
            app = connect().use(messages.clientScript, modifySnippet);
        } else {

            // serve static files
            loadSnippet.setVars(host, ports[0], ports[1]);

            var baseDir = options.server.baseDir || "./";
            var index = options.server.index || "index.html";

            app = connect()
                    .use(messages.clientScript, modifySnippet)
                    .use(loadSnippet.middleWare)
                    .use(connect.static(filePath.resolve(baseDir), {index: index}));
        }

        var server = http.createServer(app).listen(ports[1]);
        var msg;

        if (options.server) {
            msg = messages.initServer(host, ports[1], this.getBaseDir(options.server.baseDir || "./"), options);
            this.openBrowser(host, ports[1], options);
        } else {
            msg = messages.init(host, ports[0], ports[1]);
        }

        this.log(msg, options, true);

        return server;
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
     * Proxy for chokidar watching files
     * @param {Array|string} files
     * @param {object} io
     * @param {function} callback
     * @param options
     */
    watchFiles: function (files, io, callback, options) {

        var _this = this;

        var watcher = chokidar.watch(files, {persistent: true});

        watcher.on('change', function (filepath, info) {
            if (!info.size) {
                return;
            }
            callback(filepath, io, options, _this);
        });

        this.log(messages.fileWatching(Array.isArray(files) ? files.length : 1), options, true);


    },
    getFileExtension: function (path) {
        return filePath.extname(path).replace(".", "");
    }
};

module.exports = browserSync;