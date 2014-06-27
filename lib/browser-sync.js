"use strict";

var serverModule    = require("./server/");
var services        = require("./services");
var socket          = require("./sockets");
var logger          = require("./logger");
var config          = require("./config");
var tunnel          = require("./tunnel");
var messages        = require("./messages");
var utils           = require("./utils").utils;
var fileWatcher     = require("./file-watcher");

var bsClient        = require("browser-sync-client");
var _               = require("lodash");
var filePath        = require("path");
var events          = require("events");

var defaultPlugins = {
    "plugin:client:script": bsClient.middleware,
    "plugin:file:watcher": fileWatcher.plugin,
    "plugin:socket": socket.plugin,
    "plugin:logger": logger.plugin
};

/**
 * @constructor
 */
var BrowserSync = function () {
    this.cwd      = process.cwd();
    this.events   = new events.EventEmitter();
    this.events.setMaxListeners(20);
    this.plugins  = {};
    this.active   = false;
    this.config   = config;
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

        utils.fail(messages.configError(err), options, true);
    }


    utils.getPorts(options)
        .then(this.handleSuccess.bind(this, options))
        .catch(this.handleError.bind(this, options));

    return this;
};

/**
 * @param options
 * @param err
 */
BrowserSync.prototype.handleError = function (options, err) {
    this.callback(err);
    utils.fail(err, options, true);
};

/**
 * @param options
 * @param ports
 */
BrowserSync.prototype.handleSuccess = function (options, ports) {

    var that = this;
    var debug = this.debug = utils.getDebugger(options);

    function init() {
        services.init(that)(ports[0], options.files || [], options);
    }

    if (typeof options.online === "undefined") {

        debug("Checking if there's an internet connection...");

        require("dns").resolve("www.google.com", function(err) {

            if (err) {

                debug("Could not resolve www.google.com, setting online: false");

                options.online = false;

            } else {

                debug("Resolved, setting online: true");

                options.online = true;
            }

            init();
        });

    } else {

        init();
    }
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
            this.changeFile(data, options);
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
        },
        "msg:debug": function (data) {
            var debug = utils.getDebugger(options);
            debug(data.msg, data.vars || "", options);
        },
        "msg:info": function (data) {
            utils.log("info", data.msg, options);
        },
        "init": function () {
            this.active = true;
        }
    };

    _.each(events, function (func, event) {
        this.events.on(event, func.bind(this));
    }, this);
};

/**
 * Instance Cleanup
 */
BrowserSync.prototype.cleanup = function () {

    // Close any servers
    this.server.close();

    // Stop any file watching
    if (this._watcher) {
        this._watcher.close();
    }

    // Remove all event listeners
    this.events.removeAllListeners();
};

/**
 * @param {Object} data
 * @param {Object} options
 * @returns {{assetFileName: String}}
 */
BrowserSync.prototype.changeFile = function (data, options) {

    var path = data.path;
    var fileName = filePath.basename(path);

    var fileExtension = utils.getFileExtension(path);

    var obj = {
        assetFileName: fileName,
        fileExtension: fileExtension
    };

    var message = "inject";

    // RELOAD page
    if (!_.contains(options.injectFileTypes, fileExtension)) {
        obj.url = path;
        message = "reload";
    }

    obj.cwd = this.cwd;
    obj.path = path;
    obj.type = message;
    obj.log  = data.log;

    // emit the event through socket
    this.events.emit("file:reload", obj);

    return obj;
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
    var debug   = utils.getDebugger(options);

    var snippet = (!server && !proxy);
    var baseDir = utils.getBaseDir(server.baseDir || "./");
    var type    = "snippet";
    var events  = this.events;

    var bsServer = serverModule.launchServer(host, port, options, scripts);

    if (server || snippet) {
        if (bsServer) {

            this.server = bsServer.listen(port);

            debug("Static Server running...");
        }

        type = server ? "server" : "snippet";
    }

    if (proxy) {

        if (bsServer) {

            this.server = bsServer.listen(port);

            debug("Proxy running, proxing: %s", options.proxy.target);
        }

        type = "proxy";
    }

    debug("Running mode: %s", type.toUpperCase());

    options.url = utils.getUrl(utils._makeUrl(host, port), options);

    if (type && (server || proxy)) {

        if (options.tunnel && options.online) {

            tunnel.init(this, port, emitEvent);

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

    return bsServer;
};

module.exports = BrowserSync;