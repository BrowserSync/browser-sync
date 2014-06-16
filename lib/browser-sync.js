"use strict";

var serverModule    = require("./server");
var services        = require("./services");
var socket          = require("./sockets");
var logger          = require("./logger");
var config          = require("./config");
var tunnel          = require("./tunnel");
var utils           = require("./utils").utils;
var fileWatcher     = require("./file-watcher");

var bsControlPanel  = require("browser-sync-control-panel");
var bsClient        = require("browser-sync-client");
var _               = require("lodash");
var filePath        = require("path");
var events          = require("events");

var defaultPlugins = {
    "plugin:client:script": bsClient.middleware,
    "plugin:file:watcher": fileWatcher.plugin,
    "plugin:socket": socket.plugin,
    "plugin:logger": logger.plugin,
    "plugin:controlpanel": bsControlPanel.plugin
};

/**
 * @constructor
 */
var BrowserSync = function () {
    this.cwd = process.cwd();
    this.events = new events.EventEmitter();
    this.events.setMaxListeners(20);
    this.plugins = {};
    this.config = config;
    this.clientEvents = [
        "scroll",
        "input:text",
        "input:toggles",
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
        return typeof cb === "function" ? cb("Plugin must be a function.") : false;
    }
    return this.plugins["plugin:" + name] = func(); // every plugin should be a callable function
};

/**
 * Load default plugins.
 */
BrowserSync.prototype.loadPlugins = function () {

    var required = Object.keys(defaultPlugins);

    required.forEach(function (name) {
        if (typeof this.plugins[name] === "undefined") {
            this.plugins[name] = defaultPlugins[name]();
        }
    }, this);

    return true;
};

/**
 * @param name
 * @returns {*}
 */
BrowserSync.prototype.getPlugin = function (name) {
    return this.plugins["plugin:" + name] || false;
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
    this.getPlugin("logger")(this.events, options);

    // Die if both server & proxy options provided
    if (options.server && options.proxy) {
        err = "Invalid config. You cannot specify both a server & proxy option.";
        this.callback(err);
        utils.fail(err, options, true);
    }

    var success = function (ports) {

        var that = this;

        function init() {
            services.init(that)(ports[0], files, options);
        }

        if (typeof options.online === "undefined") {

            require("dns").resolve("www.google.com", function(err) {

                if (err) {
                    options.online = false;
                } else {
                    options.online = true;
                }

                init();
            });

        } else {

            init();
        }


    }.bind(this);

    var error = function (err) {
        this.callback(err);
        utils.fail(err, options, true);
    }.bind(this);

    utils.getPorts(options)
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
            this.io.sockets.emit("file:reload", data);
        },
        "browser:reload": function () {
            this.io.sockets.emit("browser:reload");
        },
        "browser:notify": function (data) {
            this.io.sockets.emit("browser:notify", data);
        },
        "service:running": function (data) {
            utils.openBrowser(data.url, options);
        }
    };

    _.each(events, function (func, event) {
        this.events.on(event, func.bind(this));
    }, this);
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

    data.cwd = this.cwd;
    data.path = path;
    data.type = message;

    // emit the event through socket
    this.events.emit("file:reload", data);

    return data;
};

/**
 * Launch the server or proxy
 * @param {String} host
 * @param {Number} port
 * @param {Object} options
 * @param {String|Function} scripts
 * @returns {Boolean|http.Server}
 */
BrowserSync.prototype.initServer = function (host, port, options, scripts) {

    var proxy   = options.proxy   || false;
    var server  = options.server  || false;

    var snippet = (!server && !proxy);
    var baseDir = utils.getBaseDir(server.baseDir || "./");
    var type    = "snippet";
    var events  = this.events;

    var servers = serverModule.launchServer(host, port, options, scripts);

    if (server || snippet) {
        if (servers.staticServer) {
            servers.staticServer.listen(port);
        }
        type = server ? "server" : "snippet";
    }

    if (proxy) {
        if (servers.proxyServer) {
            servers.proxyServer.listen(port);
        }
        type = "proxy";
    }

    options.url = utils.getUrl(utils._makeUrl(host, port), options);

    if (type && (server || proxy)) {

        if (options.tunnel && options.online) {

            tunnel.init(options, port, emitEvent);

        } else {

            emitEvent(options.urls.local);
        }

    } else {

        emitEvent("n/a");

    }

    function emitEvent(url, tunnel) {
        events.emit("service:running", {
            type: type,
            baseDir: baseDir || null,
            port: port,
            url: url,
            tunnel: tunnel ? url : false
        });
    }

    return servers;
};

module.exports = BrowserSync;