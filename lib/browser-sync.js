"use strict";

var services        = require("./services");
var hooks           = require("./hooks");
var config          = require("./config");
var messages        = require("./messages");
var utils           = require("./utils");

var _               = require("lodash");
var EE              = require("easy-extender");
var filePath        = require("path");
var events          = require("events");
var objectPath      = require("object-path");

/**
 * Required internal plugin, all can be overridden.
 */
var defaultPlugins = {
    "socket":        require("./sockets"),
    "logger":        require("./logger"),
    "file:watcher":  require("./file-watcher"),
    "server":        require("./server"),
    "tunnel":        require("./tunnel"),
    "client:script": require("browser-sync-client")
};

/**
 * @constructor
 */
var BrowserSync = function () {

    this.cwd      = process.cwd();
    this.active   = false;
    this.config   = config;

    this.events   = new events.EventEmitter();
    this.events.setMaxListeners(20);

    this.pluginManager   = new EE(defaultPlugins, hooks);

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
 * @param module
 * @param opts
 * @param cb
 */
BrowserSync.prototype.registerPlugin = function (module, opts, cb) {
    this.pluginManager.registerPlugin(module, opts, cb);
};

/**
 * Get middleware
 * @returns {*}
 */
BrowserSync.prototype.getMiddleware = function (type) {

    var types = {
        "connector": messages.socketConnector(this.options.port, this.options),
        "socket-js": this.options.socketJs
    };

    if (type in types) {
        return function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(types[type]);
        };
    }
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

    this.pluginManager.init();

    this.pluginManager.get("logger")(this.events, options);

    // Die if both server & proxy options provided
    if (options.server && options.proxy) {

        err = "Invalid config. You cannot specify both a server & proxy option.";

        this.callback(err);
        this.events.emit("config:error", {msg: err});
        utils.fail(true);
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

    options.port = ports[0];

    function init() {
        services.init(that)(options);
    }

    if (_.isUndefined(options.online)) {

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
 * @param [defaultValue]
 */
BrowserSync.prototype.getOption = function (name, defaultValue) {
    return objectPath.get(this.options, name, defaultValue);
};

BrowserSync.prototype.getOptions = function () {
    return this.options;
};

BrowserSync.prototype.setOption = function (name, value) {

    var objectPath = require("object-path");

    if (objectPath.get(this.options, name)) {
        objectPath.set(this.options, name, value);
        this.events.emit("options:set", {name: name, value: value, options: this.options});
    }

    return this.options;
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
        /**
         * Things that happened after the service is running
         * @param data
         */
        "service:running": function (data) {

            if (data.type !== "snippet") {
                utils.openBrowser(data.url, options);
            }

            // log about any file watching
            if (this.watchers) {
                this.events.emit("file:watching", this.watchers);
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

    this.pluginManager.plugins = {};
    this.pluginManager.pluginOptions = {};

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

module.exports = BrowserSync;