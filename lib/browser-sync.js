"use strict";

var messages     = require("./messages");
var serverModule = require("./server");
var services     = require("./services");
var utils        = require("./utils").utils;
var fileWatcher  = require("./file-watcher");

var bsClient     = require("browser-sync-client");
var _            = require("lodash");
var filePath     = require("path");
var events       = require("events");


var defaultPlugins = {
    "plugin:client:script": bsClient.middleware(),
    "plugin:file:watcher": fileWatcher.plugin()
};

/**
 * @constructor
 */
var BrowserSync = function () {
    this.cwd = process.cwd();
    this.minPorts = 2;
    this.events = new events.EventEmitter();
    this.events.setMaxListeners(20);
    this.plugins = {};
    this.clientEvents = [
        "scroll",
        "input:text",
        "input:select",
        "input:radio",
        "input:checkbox",
        "form:submit",
        "form:reset",
        "click"
    ];
};

/**
 * Allow plugins to be registered from outside
 * @param {String} name
 * @param {Function} func
 * @param {Function} [cb]
 */
BrowserSync.prototype.registerPlugin = function (name, func, cb) {
    if ("function" !== typeof func) {
        return typeof cb === "function" ? cb(messages.plugin.error()) : false;
    }
    return this.plugins[name] = func(); // every plugin should be a callable function
};

/**
 * Load default plugins for anything not used.
 */
BrowserSync.prototype.loadPlugins = function () {

    var required = Object.keys(defaultPlugins);

    required.forEach(function (name) {
        if (typeof this.plugins[name] === "undefined") {
            this.plugins[name] = defaultPlugins[name];
        }
    }, this);

    return true;
};

/**
 * @param name
 * @returns {*}
 */
BrowserSync.prototype.getPlugin = function (name) {
    return this.plugins["plugin:" + name];
};

/**
 * @param {Array} files
 * @param {Object} options
 * @param {String} version
 * @param {Function} cb
 * @returns {BrowserSync}
 */
BrowserSync.prototype.init = function (files, options, version, cb) {

    var err;
    this.version = options.version = version;
    this.cb = cb;

    this.loadPlugins();

    // Die if both server & proxy options provided
    if (options.server && options.proxy) {
        err = messages.server.withProxy();
        this.callback(err);
        utils.fail(err, options, true);
    }

    var success = function (ports) {
        services.init(this)(ports, files, options);
    }.bind(this);

    var error = function (err) {
        console.log(err);
        this.callback(err);
        utils.fail(messages.ports.invalid(3), options, true);
    }.bind(this);

    utils.getPorts(options, this.minPorts)
        .then(success)
        .catch(error);

    return this;
};

/**
 * Callback helper
 * @param err
 * @param [data]
 */
BrowserSync.prototype.callback = function (err, data) {
    if ("function" === typeof this.cb) {
        this.cb(err, data, this);
    }
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
        "client:connected": function (data) {
            this.logConnection(data.ua, options);
        },
        "log": function (data) {
            utils.log(data.msg, options, data.override);
        }
    };

    _.each(events, function (func, event) {
        this.events.on(event, func.bind(this));
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
    this.events.emit("file:reload", data);

    // log the message to the console
    this.events.emit("log", {msg: messages.files.changed(utils.resolveRelativeFilePath(path, this.cwd)), override: false});
    this.events.emit("log", {msg: messages.browser[message](), override: false});

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
        utils.log(msg, options, false);
    }

    return servers;
};

module.exports = BrowserSync;