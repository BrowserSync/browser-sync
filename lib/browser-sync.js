"use strict";

var services        = require("./services");
var hooks           = require("./hooks");
var async           = require("./async");
var config          = require("./config");
var messages        = require("./messages");
var utils           = require("./utils");
var logger          = require("./logger");

var _               = require("lodash");
var EE              = require("easy-extender");
var filePath        = require("path");

/**
 * Required internal plugin, all can be overridden.
 */
var defaultPlugins = {
    "logger":        logger,
    "socket":        require("./sockets"),
    "file:watcher":  require("./file-watcher"),
    "server":        require("./server"),
    "tunnel":        require("./tunnel"),
    "client:script": require("browser-sync-client")
};

/**
 * @constructor
 */
var BrowserSync = function (emitter) {

    this.cwd      = process.cwd();
    this.active   = false;
    this.paused   = false;
    this.config   = config;

    // Events
    this.events   = emitter;

    this._reloadQueue   = [];
    this._browserReload = false;

    // Plugin management
    this.pluginManager = new EE(defaultPlugins, hooks);

    this._userPlugins  = [];

    this.clientEvents  = [
        "scroll",
        "input:text",
        "input:toggles",
        "form:submit",
        "form:reset",
        "click"
    ];
};

/**
 * @param {Map} options
 * @param {Function} cb
 * @returns {BrowserSync}
 */
BrowserSync.prototype.init = function (options, cb) {

    var bs = this;
    bs.cb  = cb;

    // -------------
    // INIT
    // -------------
    utils.verifyConfig(options, bs.cb);
    bs.options = utils.updateOptions(options);
    bs.pluginManager.init();
    bs.logger   = bs.pluginManager.get("logger")(bs.events, bs);
    bs.debugger = bs.logger.clone({useLevelPrefixes: true});
    bs.debug    = bs.debugger.debug;

    var asyncTasks = [
        {
            "step": "Find an empty port",
            "fn": async.getEmptyPort
        },
        {
            "step": "Check online status",
            "fn": async.getOnlineStatus
        },
        {
            "step": "Setting Internal Events",
            "fn": async.setInternalEvents
        }
    ];

    require("async").eachSeries(asyncTasks, function (item, cb) {
        bs.debug("{yellow:Starting Step: " + item.step);
        item.fn(bs, function () {
            bs.debug("{green:Step Complete: " + item.step);
            cb();
        });
    }, function (err) {

        // All Done here
        console.log(bs.options.get("port"));
        console.log(bs.options.get("online"));
        console.log(bs.options.get("scheme"));
    });


    // -------------
    // SERVER
    // -------------


    // -------------
    // PLUGINS
    // -------------
};

/**
 * @param module
 * @param opts
 * @param cb
 */
BrowserSync.prototype.registerPlugin = function (module, opts, cb) {

    this.pluginManager.registerPlugin(module, opts, cb);

    if (module["plugin:name"]) {
        this._userPlugins.push(module);
    }
};

/**
 * @param {Function} [filter]
 */
BrowserSync.prototype.getUserPlugins = function (filter) {

    filter = filter || function () {
        return true;
    };

    /**
     * Transform Plugins option
     */
    this.userPlugins = this._userPlugins.filter(filter).map(function (plugin) {
        return {
            name: plugin["plugin:name"],
            active: plugin._enabled
        };
    });

    return this.userPlugins;
};

/**
 * Get middleware
 * @returns {*}
 */
BrowserSync.prototype.getMiddleware = function (type) {

    var types = {
        "connector": messages.socketConnector(this.options.port, this.options, true),
        "socket-js": require("./snippet").utils.getSocketScript()
    };

    if (type in types) {
        return function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(types[type]);
        };
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
 */
BrowserSync.prototype.getOption = function (name) {
    this.debug("Getting option: {magenta:%s", name);
    return this.options.get(name);
};

/**
 * Callback helper
 * @param path
 */
BrowserSync.prototype.getOptionIn = function (path) {
    this.debug("Getting option via path: {magenta:%s", path);
    return this.options.getIn(path);
};

/**
 * @returns {BrowserSync.options}
 */
BrowserSync.prototype.getOptions = function () {
    return this.options;
};

/**
 * @returns {BrowserSync.options}
 */
BrowserSync.prototype.getLogger = logger.getLogger;

/**
 * @param {String} name
 * @param {*} value
 * @returns {BrowserSync.options|*}
 */
BrowserSync.prototype.setOption = function (name, value) {
    this.options = this.options.set(name, value);
    this.events.emit("options:set", {path: name, value: value, options: this.options});
    return this.options;
};

BrowserSync.prototype.setOptionIn = function (path, value) {
    this.options = this.options.setIn(path, value);
    this.events.emit("options:set", {path: path, value: value, options: this.options});
    return this.options;
};


/**
 * Handle Browser Reloads
 */
BrowserSync.prototype.doBrowserReload = function () {
    var bs = this;
    if (bs._browserReload) {
        return;
    }
    bs._browserReload = setTimeout(function () {
        bs.io.sockets.emit("browser:reload");
        clearTimeout(bs._browserReload);
        bs._browserReload = false;
    }, this.options.get("reloadDelay"));
};

/**
 * Handle a queue of reloads
 * @param {Object} data
 */
BrowserSync.prototype.doFileReload = function (data) {

    var bs    = this;

    bs._reloadQueue = bs._reloadQueue || [];
    bs._reloadQueue.push(data);

    if (bs._reloadTimer) {
        return;
    }

    bs._reloadTimer = setTimeout(function () {
        if (utils.willCauseReload(bs._reloadQueue.map(function (item) { return item.path; }), bs.options.get("injectFileTypes").toJS())) {
            bs.io.sockets.emit("browser:reload");
        } else {
            bs._reloadQueue.forEach(function (item) {
                bs.io.sockets.emit("file:reload", item);
            });
        }
        clearTimeout(bs._reloadTimer);
        bs._reloadTimer = undefined;
        bs._reloadQueue = [];
    }, bs.options.get("reloadDelay"));
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
        this.debug("Closing server...");
        this.server.close();
    }

    // Stop any file watching
    if (this.watchers) {
        this.debug("Stopping watchers...");
        _.each(this.watchers, function (item) {
            item.watcher.end();
        });
    }

    // Remove all event listeners
    if (this.events) {
        this.debug("Removing event listeners...");
        this.events.removeAllListeners();
    }

    // Reset the flag
    this.debug("Setting {magenta:active: false");
    this.active = false;
    this.paused = false;

    this.pluginManager.plugins       = {};
    this.pluginManager.pluginOptions = {};

    this._userPlugins                = [];
    this.userPlugins                 = [];
    this._reloadTimer                = undefined;
    this._reloadQueue                = undefined;

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
