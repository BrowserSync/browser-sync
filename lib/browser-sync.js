"use strict";

var messages     = require("./messages");
var api          = require("./api");
var controlPanel = require("./control-panel");
var fileWatcher  = require("./file-watcher");
var serverModule = require("./server");
var socket       = require("./sockets");
var utils        = require("./utils").utils;

var _            = require("lodash");
var filePath     = require("path");
var events       = require("events");

/**
 * @constructor
 */
var BrowserSync = function () {
    this.cwd = process.cwd();
    this.minPorts = 2;
    this.emitter = new events.EventEmitter();
    this.emitter.setMaxListeners(20);
    this.clientEvents = [
        "scroll",
        "input:text",
        "input:select",
        "input:radio",
        "input:checkbox",
        "form:submit",
        "form:reset",
        "click"
    ]
};

/**
 * @param {Array} files
 * @param {Object} options
 * @param {String} version
 * @returns {exports.EventEmitter}
 */
BrowserSync.prototype.init = function (files, options, version) {

    this.version = options.version = version;

    // Die if both server & proxy options provided
    if (options.server && options.proxy) {
        this.fail(messages.server.withProxy(), options, true);
    }

    var success = function (ports) {
        this.startServices(ports, files, options);
    }.bind(this);

    var error = function () {
        this.fail(messages.ports.invalid(3), options, true);
    }.bind(this);

    utils.getPorts(options)
        .then(success)
        .catch(error);

    return this.emitter;
};

/**
 * @param {Object} ports
 * @param {Array} files
 * @param {Object} options
 */
BrowserSync.prototype.startServices = function (ports, files, options) {

    var servers;
    var msg;

    this.io = socket.init(ports.socket, this.clientEvents, options);

    // register internal events
    this.registerInternalEvents(options);

    options.host = utils.getHostIp(options);

    // Start file watcher
    if (files.length) {
        fileWatcher.init(files, options, this.emitter);
    }

    // launch the server/proxy
    if (options.server || options.proxy) {
        servers = this.initServer(options.host, ports, options);
    } else {
        msg = messages.init(options.host, ports, options);
        utils.log(msg, options, true);
    }

    // Always Launch the control panel
    var scriptTags = messages.scriptTags(options.host, ports, options, "controlPanel");
    controlPanel.launchControlPanel(scriptTags, options).listen(ports.controlPanel);

    // get/emit the api
    var bsApi = api.getApi(ports, options, servers);

    this.emitter.emit("init", bsApi);
};

/**
 * Internal Events
 * @param {Object} options
 */
BrowserSync.prototype.registerInternalEvents = function (options) {

    var events = {
        "file:changed": function (data) {
            this.changeFile(data.path, options);
        },
        "file:reload": function (data) {
            this.io.sockets.emit("reload", data);
        },
        "file:watching": function (data) {
            if (data.watcher._patterns) {
                utils.log(messages.files.watching(data.watcher._patterns), options, false);
            }
        },
        "log": function (data) {
            utils.log(data.msg, options, data.override);
        }
    };

    _.each(events, function (func, event) {
        this.emitter.on(event, func.bind(this));
    }, this);
};
/**
 * Log a successful client connection
 * @param {String} ua
 * @param {Object} userOptions
 */
BrowserSync.prototype.logConnection = function (ua, userOptions) {
    var msg = messages.browser.connection(utils.getUaString(ua));
    utils.log(msg, userOptions, false);
};

/**
 * @param {String} path
 * @param {Object} options
 * @returns {{assetFileName: String}}
 */
BrowserSync.prototype.changeFile = function (path, options) {

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
    this.emitter.emit("file:reload", data);

    // log the message to the console
    this.emitter.emit("log", {msg: messages.files.changed(utils.resolveRelativeFilePath(path, this.cwd)), override: false});
    this.emitter.emit("log", {msg: messages.browser[message](), override: false});

    return data;
};

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {Object} ports
 * @param {Object} options
 * @returns {*|http.Server}
 */
BrowserSync.prototype.initServer = function (host, ports, options) {

    var proxy = options.proxy || false;
    var server = options.server || false;
    var baseDir = utils.getBaseDir(server.baseDir || "./");
    var open = false;
    var msg;

    var servers = serverModule.launchServer(host, ports, options, this.io);

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
};

module.exports = BrowserSync;