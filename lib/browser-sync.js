"use strict";

var serverModule    = require("./server/");
var services        = require("./services");
var socket          = require("./sockets");
var hooks           = require("./hooks");
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

/**
 * Required internal plugins.
 */
var defaultPlugins = {
    "plugin:client:script": bsClient,
    "plugin:file:watcher": fileWatcher,
    "plugin:socket": socket,
    "plugin:logger": logger
};

/**
 * @constructor
 */
var BrowserSync = function () {
    this.cwd      = process.cwd();
    this.events   = new events.EventEmitter();
    this.defaultPlugins = defaultPlugins;
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
 * @param {Object} module
 * @param {Function} [cb]
 */
BrowserSync.prototype.registerPlugin = function (module, opts, cb) {

    var pluginOptions;

    this.pluginOptions = {};

    if (!_.isFunction(module.plugin)) {
        return _.isFunction(cb) ? cb("Module must implement a .plugin() method") : false;
    }

    if (!cb && opts) {
        if (_.isFunction(opts)) {
            cb = opts;
        } else {
            pluginOptions = opts;
        }
    }

    var name = _.isUndefined(module["plugin:name"]) ? _.uniqueId() : module["plugin:name"];

    this.pluginOptions[name] = pluginOptions;
    this.plugins["plugin:" + name] = module;

    if (_.isFunction(cb)) {
        cb(null);
    }
};

/**
 * Load default plugins.
 */
BrowserSync.prototype.loadPlugins = function () {

    var required = Object.keys(defaultPlugins);

    required.forEach(function (name) {
        if (_.isUndefined(this.plugins[name])) {
            this.plugins[name] = defaultPlugins[name];
        }
    }, this);

    return true;
};

/**
 * Retrieve a plugin from the registry
 * @param name
 * @returns {*}
 */
BrowserSync.prototype.getPlugin = function (name) {

    return this.plugins["plugin:" + name].plugin || false;
};

/**
 * Start user-defined plugins
 * @returns {*}
 */
BrowserSync.prototype.initUserPlugins = function () {

    var userPlugins = _.difference(Object.keys(this.plugins), Object.keys(this.defaultPlugins));

    if (userPlugins.length) {

        userPlugins.forEach(function (plugin) {

            var name = plugin.replace("plugin:", "");

            var pluginOptions = {};

            if (this.pluginOptions) {
                pluginOptions = this.pluginOptions[name];
            }

            this.getPlugin(name)(this, pluginOptions, this.getLogger(name));

        }, this);
    }
};

/**
 * Start user-defined plugins
 * @returns {*}
 */
BrowserSync.prototype.getLogger = function (name) {

    var events  = this.events;
    var options = this.options;

    return function (type, msg, timeout) {
        if (type === "info" || type === "debug") {
            utils.log(type, messages.getPrefix(name) + msg, options);
        }
        if (type === "notify") {
            events.emit("browser:notify", {
                message: messages.getNotifyPrefix(name) + msg,
                timeout: timeout || 2000
            });
        }
    };
};

/**
 * Get middlewares
 * @returns {*}
 */
BrowserSync.prototype.getMiddleware = function (type) {

    var types = {
        "connector": messages.socketConnector(this.options.port, this.options),
        "socket-js": this.options.socketJs
    };

    if (type in types) {
        return function (req, res, next) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(types[type]);
        };
    }
};

/**
 * @param name
 * @param hook
 * @returns {*}
 */
BrowserSync.prototype.getHook = function (name, hook) {

    if (_.isFunction(this.plugins[name][hook])) {
        return this.plugins[name][hook];
    }
};

/**
 * Run a hook
 * @param hook The internal name of the hook
 * @param {*} data Any additional data
 * @returns {*}
 */
BrowserSync.prototype.hook = function (hook, data) {

    return hooks[hook].bind(this)(data);
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

    if (_.isFunction(this.cb)) {
        this.cb(err, data, this);
    }

    this.events.emit("service:ready");
};

/**
 * Callback helper
 * @param name
 * @param value
 */
BrowserSync.prototype.setOption = function (name, value) {

    var segs = name.split(".");

    if (segs.length === 2) {
        this.options[segs[0]][segs[1]] = value;
    } else {
        this.options[name] = value;
    }

    this.events.emit("options:set", {name: name, value: value, options: this.options});
};

/**
 * Internal Events
 * @param {Object} options
 */
BrowserSync.prototype.registerInternalEvents = function (options) {

    var events = {
        "file:changed": function (data) {
            if (data.namespace === "core") {
                if (_.isUndefined(data.log)) {
                    data.log = options.logFileChanges;
                }
                this.changeFile(data, options);
            }
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
            if (data.type !== "snippet") {
                utils.openBrowser(data.url, options);
            }
        },
        "options:set": function (data) {
            this.io.sockets.emit("options:set", data);
        },
        "msg:debug": function (data) {
            var debug = utils.getDebugger(options);
            debug(data.msg, data.vars || "", options);
        },
        "msg:info": function (data) {
            var infoLog = utils.getInfoLogger(options);
            infoLog(data.msg, data.vars || "", _.isUndefined(data.prefix) ? true : data.prefix);
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
BrowserSync.prototype.cleanup = function (cb) {

    if (!this.active) {
        return;
    }

    utils.log("debug", messages.exit(), this.options);

    // Close any servers
    if (this.server) {
        this.server.close();
    }

    // Stop any file watching
    if (this.watchers) {
        _.each(this.watchers, function (item) {
            item.watcher.end();
        });
    }

    // Remove all event listeners
    if (this.events) {
        this.events.removeAllListeners();
    }

    // Reset the flag
    this.active = false;

    this.plugins = {};

    if (_.isFunction(cb)) {
        cb(null);
    }
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
 * @param {Object} options
 * @param {String|Function} scripts
 * @returns {Boolean|http.Server}
 */
BrowserSync.prototype.initServer = function (options, scripts) {

    var proxy   = options.proxy   || false;
    var secure  = options.https   || false;
    var server  = options.server  || false;
    var debug   = utils.getDebugger(options);

    var snippet    = (!server && !proxy);
    var baseDir    = utils.getBaseDir(server.baseDir || "./");
    var type       = "snippet";
    var events     = this.events;

    if (options.server) {
        options.server.middleware = this.hook("server:middleware", server.middleware || null);
    }

    var bsServer   = serverModule.createServer(options, scripts, this);

    if (server || snippet) {
        debug("Static Server running (" + (secure ? "https" : "http") + ") ...");
        type = server ? "server" : "snippet";
    }

    if (proxy) {
        debug("Proxy running, proxing: %s", options.proxy.target);
        type = "proxy";
    }

    if (bsServer) {
        this.server = bsServer.listen(options.port);
    }

    debug("Running mode: %s", type.toUpperCase());


    if (type && (server || proxy)) {
        if (options.tunnel && options.online) {
            tunnel.init(this, options.port, finished);
        } else {
            finished(options.urls.local);
        }
    } else {
        finished("n/a");
    }

    function finished(url, tunnel) {

        events.emit("service:running", {
            type: type,
            baseDir: baseDir || null,
            port: options.port,
            url: url,
            tunnel: tunnel ? url : false
        });
    }

    return bsServer;
};

module.exports = BrowserSync;

