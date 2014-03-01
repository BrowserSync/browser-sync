"use strict";

var _ = require("lodash");
var filePath = require("path");
var messages = require("./messages");
var api = require("./api");
var controlPanel = require("./control-panel");
var events = require("events");
var fileWatcher = require("./file-watcher");
var serverModule = require("./server");
var utils  = require("./utils").utils;

var BrowserSync = function () {};
var cwd = process.cwd();
var io;

var emitter;
emitter = new events.EventEmitter();
emitter.setMaxListeners(20);

BrowserSync.prototype = {
    cwd: cwd,
    options: {
        injectFileTypes: ["css", "png", "jpg", "jpeg", "svg", "gif"],
        minPorts: 2
    },
    clientEvents: [
        "scroll",
        "input:text",
        "input:select",
        "input:radio",
        "input:checkbox",
        "form:submit",
        "form:reset",
        "click"
    ],
    /**
     * @param {Array} files
     * @param {Object} options
     * @param {String} version
     */
    init: function (files, options, version) {

        var bs = this;
        this.version = options.version = version;

        // Die if both server & proxy options provided
        if (options.server && options.proxy) {
            this.fail(messages.server.withProxy(), options, true);
        }

        utils.getPorts(options).then(function (ports) {
            bs.startServices(ports, files, options);
        }).catch(function () {
            bs.fail(messages.ports.invalid(3), options, true);
        });

        return emitter;
    },
    /**
     * @param {Object} ports
     * @param {Array} files
     * @param {Object} options
     */
    startServices: function (ports, files, options) {

        var servers;
        var msg;
        var ioLocal = this.setupSocket(ports);

        // register internal events
        this.registerEvents(emitter, options, ioLocal);

        options.host = utils.getHostIp(options);

        // Handle socket connections
        this.handleSocketConnection(this.clientEvents, options);

        // Start file watcher
        fileWatcher.init(files, options, emitter);

        // launch the server/proxy
        if (options.server || options.proxy) {
            servers = this.initServer(options.host, ports, options, ioLocal);
        } else {
            msg = messages.init(options.host, ports, options);
            utils.log(msg, options, true);
        }

        // Always Launch the control panel
        var scriptTags = messages.scriptTags(options.host, ports, options, "controlPanel");
        controlPanel.launchControlPanel(scriptTags, options).listen(ports.controlPanel);

        // get/emit the api
        var bsApi = api.getApi(ports, options, servers);

        emitter.emit("init", bsApi);
    },
    /**
     * Internal Events
     * @param {EventEmitter} emitter
     * @param {Object} options
     * @param {Socket} ioLocal
     */
    registerEvents: function (emitter, options, ioLocal) {
        var bs = this;
        emitter.on("file:changed", function (data) {
            bs.changeFile(data.path, options);
        });
        emitter.on("file:reload", function (data) {
            ioLocal.sockets.emit("reload", data);
        });
        emitter.on("log", function (data) {
            utils.log(data.msg, options, data.override);
        });
    },
    getEmitter: function () {
        return emitter;
    },
    /**
     * Set up the socket.io server
     * @param {Object} ports
     * @returns {socket}
     */
    setupSocket: function (ports) {

        io = require("socket.io").listen(ports.socket);
        io.set("log level", 0);

        return io;
    },
    /**
     * Things to do when a client connects
     * @param {Array} events
     * @param {Object} userOptions
     */
    handleSocketConnection: function (events, userOptions) {

        var bs = this;
        var ua;

        io.sockets.on("connection", function (client) {

            // set ghostmode callbacks
            if (userOptions.ghostMode) {
                events.forEach(function (evt) {
                    bs.handleClientSocketEvent(client, evt);
                });
            }

            client.emit("connection", userOptions);

            ua = client.handshake.headers["user-agent"];

            bs.logConnection(ua, userOptions);
        });
    },
    /**
     * Add a client event & it's callback
     * @param {Object} client
     * @param {String} event
     */
    handleClientSocketEvent: function (client, event) {
        client.on(event, function (data) {
            client.broadcast.emit(event, data);
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
        var msg = messages.browser.connection(utils.getUaString(ua));
        utils.log(msg, userOptions, false);
    },
    /**
     * Expose messages for tests
     * @returns {*|exports}
     */
    getMessages: function () {
        return messages;
    },
    /**
     * @param {String} path
     * @param {Object} options
     * @returns {{assetFileName: String}}
     */
    changeFile: function (path, options) {

        var fileName = filePath.basename(path);
        var fileExtension = utils.getFileExtension(path);

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
        emitter.emit("file:reload", data);

        // log the message to the console
        emitter.emit("log", {msg: messages.files.changed(utils.resolveRelativeFilePath(path, this.cwd)), override: false});
        emitter.emit("log", {msg: messages.browser[message](), override: false});

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

        var proxy = options.proxy || false;
        var server = options.server || false;
        var baseDir = utils.getBaseDir(server.baseDir || "./");
        var open = false;
        var msg;

        var servers = serverModule.launchServer(host, ports, options, ioLocal);

        if (server) {
            if (servers.staticServer) {
                servers.staticServer.listen(ports.server);
            }
            msg = messages.initServer(host, ports.server, baseDir);
            open = "server";
        }

        if (proxy) {
            if (servers.proxyServer) {
                servers.proxyServer.listen(ports.proxy);
            }
            msg = messages.initProxy(host, ports.proxy);
            open = "proxy";
        }

        options.url = utils.getUrl(messages._makeUrl(host, ports[open], "http:"), options);

        if (open && (server || proxy)) {
            utils.openBrowser(options.url, options);
        }

        utils.log(msg, options, true);

        return servers;
    }
};

module.exports = BrowserSync;