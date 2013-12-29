"use strict";

var portScanner = require("portscanner");
var _ = require("lodash");
var filePath = require("path");
var devIp = require("dev-ip");
var UAParser = require("ua-parser-js");

var messages = require("./messages");
var fileWatcher = require("./file-watcher");
var serverModule = require("./server");
var parser = new UAParser();

var browserSync = function () {};
var cwd = process.cwd();

var io;

var clients = [];

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

        var minPorts      = this.options.minPorts;
        var portRange     = this.getPortRange(minPorts, options);
        var callback      = this.getPortsCallback(files, options);

        if (portRange) {
            this.getPorts(minPorts, callback, portRange.min, portRange.max);
        } else {
            this.fail(messages.ports.invalid(minPorts), options, true);
        }
    },
    /**
     * @param {Array} files
     * @param {Object} options
     * @returns {Function}
     */
    getPortsCallback: function (files, options) {

        var startServices = this.startServices;
        var _this = this;

        return function (ports) {
            startServices.call(_this, {
                ports: ports,
                files: files,
                options: options
            });
        };
    },
    /**
     * @param {Object} args
     */
    startServices: function (args) {

        var ports   = args.ports;
        var files   = args.files;
        var options = args.options;

        var ioLocal = this.setupSocket(ports);

        this.handleSocketConnection(this.ghostModeCallbacks, options, this.handleClientSocketEvent);

        fileWatcher.init(this.changeFile, this.log, files, ioLocal, options, this);

        // launch the server
        this.initServer(this.getHostIp(options, devIp.getIp(null)), ports, options, ioLocal);
    },
    /**
     *
     * @param {Number} minCount
     * @param {Object} options
     * @returns {{min: Number, max: Number}|Boolean}
     */
    getPortRange: function (minCount, options) {

        var ports = options.ports, min, max;

        if (ports) {
            min   = ports.min;
            max   = ports.max;
            if (min && max) {
                if ((max - min + 1) < minCount) {
                    return false;
                }
                return {
                    min: min,
                    max: max
                };
            }
            if (min) {
                max = min + 500;
                return {
                    min: min,
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
     * @returns {socket}
     */
    setupSocket: function (ports) {

        io = require("socket.io").listen(ports[0]);
        io.set("log level", 0);
        io.set("sync disconnect on unload", true);

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

            clients.push(client);

            // set ghostmode callbacks
            if (userOptions.ghostMode) {
                for (var i = 0, n = events.length; i < n; i += 1) {
                    handle(client, events[i], userOptions, _this);
                }
            }

            client.emit("connection", userOptions);

            ua = client.handshake.headers["user-agent"];

            _this.logConnection(ua, userOptions);

            client.on("disconnect", function() {
                clients.splice(clients.indexOf(client), 1);
            });
        });
    },
    /**
     * Add a client event & it's callback
     * @param {Object} client
     * @param {String} event
     * @param {Object} userOptions
     * @param {Object} _this
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
        this.log(messages.browser.connection(parser.setUA(ua).getBrowser()), userOptions, false);
    },
    /**
     * ghostMode Callbacks (responses to client events)
     */
    ghostModeCallbacks: [
        {
            name: "scroll",
            callback: function (client, data) {
                client.broadcast.emit("scroll:update", { position: data.pos, ghostId: data.ghostId, url: data.url});
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
        },
        {
            name: "click",
            callback: function (client, data) {
                client.broadcast.emit("click", data);
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
     * Launch the server for serving the client JS plus static files
     * @param {String} host
     * @param {Array} ports
     * @param {Object} options
     * @param {socket} ioLocal
     * @returns {*|http.Server}
     */
    initServer: function (host, ports, options, ioLocal) {

        var proxy  = options.proxy || false;
        var server = options.server || false;
        var msg;

        var servers = serverModule.launchServer(host, ports, options, ioLocal);

        if (server) {
            msg = messages.initServer(host, ports[1], this.getBaseDir(options.server.baseDir || "./"));
            this.openBrowser(host, ports[1], options);
        }

        if (proxy) {
            msg = messages.initProxy(host, ports[2]);
            this.openBrowser(host, ports[2], options);
        }

        if (!server && !proxy) {
            msg = messages.init(host, ports[0], ports[1]);
        }

        this.log(msg, options, true);

        return servers;
    },
    /**
     * Open the page in browser
     * @param {String} host
     * @param {String|Number} port
     * @param {Object} options
     */
    openBrowser: function (host, port, options) {
        if (options.open) {
            var url = messages._makeUrl(host, port, "http:");
            require("open")(url);
        }
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