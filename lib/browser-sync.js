"use strict";

var _ = require("lodash");
var filePath = require("path");
var devIp = require("dev-ip");
var UAParser = require("ua-parser-js");

var portScanner = require("./ports");
var messages = require("./messages");
var controlPanel = require("./control-panel");
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
        minPorts: 2
    },
    /**
     * @param {Array} files
     * @param {Object} options
     */
    init: function (files, options) {

        // Die if both server & proxy options provided
        if (options.server && options.proxy) {
            this.fail(messages.server.withProxy(), options, true);
        }

        this.userOptions  = options;
        var minPorts      = (options.server || options.proxy) ? 3 : this.options.minPorts;
        var minPortRange  = options.ports && options.ports.min;
        var maxPortRange  = options.ports && options.ports.max;
        var portRange     = portScanner.getPortRange(minPorts, minPortRange, maxPortRange);
        var callback      = this.getPortsCallback(files, options);

        if (portRange) {
            portScanner.getPorts(minPorts, callback, portRange.min, portRange.max);
        } else {
            this.fail(messages.ports.invalid(minPorts), options, true);
        }
    },
    /**
     * @param {Array} ports
     * @param {Array} names
     * @returns {Object}
     */
    assignPortNames: function (ports, names) {
        var named = {};
        _.each(ports, function (port, i) {
            named[names[i]] = port;
        });
        return named;
    },
    /**
     * @param {Array} files
     * @param {Object} [options]
     * @returns {Function}
     */
    getPortsCallback: function (files, options) {

        var startServices = this.startServices;
        var assignPortNames = this.assignPortNames;
        var _this = this;

        return function (ports) {

            var names = ["socket", "controlPanel"];
            var namedPorts;

            if (options.server) {
                names.push("server");
            }
            if (options.proxy) {
                names.push("proxy");
            }

            namedPorts = assignPortNames(ports, names);

            startServices.call(_this, {
                ports: namedPorts,
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
        var hostIp  = this.getHostIp(options, devIp.getIp(null));
        var msg;

        var ioLocal = this.setupSocket(ports);

        this.handleSocketConnection(this.ghostModeCallbacks, options, this.handleClientSocketEvent);

        fileWatcher.init(this.changeFile, this.log, files, ioLocal, options, this);

        // launch the server
        if (options.server || options.proxy) {
            this.initServer(hostIp, ports, options, ioLocal);
        } else {
            msg = messages.init(hostIp, ports);
            this.log(msg, options, true);
        }

        controlPanel.launchControlPanel(hostIp, ports, options, ioLocal);
    },
    /**
     * Set up the socket.io server
     * @param {Object} ports
     * @returns {socket}
     */
    setupSocket: function (ports) {

        io = require("socket.io").listen(ports.socket);
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
     * @param {Object} ports
     * @param {Object} options
     * @param {socket} ioLocal
     * @returns {*|http.Server}
     */
    initServer: function (host, ports, options, ioLocal) {

        var proxy  = options.proxy || false;
        var server = options.server || false;
        var open   = false;
        var msg;

        var servers = serverModule.launchServer(host, ports, options, ioLocal);

        if (server) {
            msg = messages.initServer(host, ports.server, this.getBaseDir(options.server.baseDir || "./"));
            open = "server";
        }

        if (proxy) {
            msg = messages.initProxy(host, ports.proxy);
            open = "proxy";
        }

        if (open) {
            this.openBrowser(host, ports[open], options);
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