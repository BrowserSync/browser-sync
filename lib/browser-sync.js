"use strict";

var hooks           = require("./hooks");
var asyncTasks      = require("./async-tasks");
var config          = require("./config");
var messages        = require("./connect-utils");
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
    "client:script": require("browser-sync-client"),
    "UI":            require("browser-sync-ui")
};

/**
 * @constructor
 */
var BrowserSync = function (emitter) {

    this.cwd      = process.cwd();
    this.active   = false;
    this.paused   = false;
    this.config   = config;
    this.utils    = utils;
    this.events   = this.emitter = emitter;

    this._userPlugins   = [];
    this._reloadQueue   = [];
    this._browserReload = false;

    // Plugin management
    this.pluginManager = new EE(defaultPlugins, hooks);

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
    bs.cb  = cb || function () {/*noop*/};

    // verify/update options
    utils.verifyConfig(options, bs.cb);
    bs.options = utils.updateOptions(options);
    bs.pluginManager.init();

    // set loggers
    bs.logger   = bs.pluginManager.get("logger")(bs.events, bs);
    bs.debugger = bs.logger.clone({useLevelPrefixes: true});
    bs.debug    = bs.debugger.debug;

    require("async").eachSeries(
        asyncTasks,
        taskRunner(bs),   // Run each setup task in sequence
        tasksComplete(bs) // Handle completion
    );

    return this;
};

/**
 * Run setup tasks in sequence.
 * Each task is a pure function.
 * They can return options or instance properties to set,
 * but they cannot set them directly.
 * @param bs
 * @returns {Function}
 */
function taskRunner (bs) {
    return function (item, cb) {
        bs.debug("-> {yellow:Starting Step: " + item.step);

        // Execute each step
        item.fn(bs, function (err, out) {
            if (err) {
                return cb(err);
            }
            if (out) {
                /**
                 * Any top-level options returned?
                 */
                if (out.options) {
                    Object.keys(out.options).forEach(function (key) {
                        bs.setOption(key, out.options[key]);
                    });
                }
                /**
                 * Any options returned that require path access?
                 */
                if (out.optionsIn) {
                    out.optionsIn.forEach(function (item) {
                        bs.setOptionIn(item.path, item.value);
                    });
                }
                /**
                 * Any instance properties returned?
                 */
                if (out.instance) {
                    Object.keys(out.instance).forEach(function (key) {
                        bs[key] = out.instance[key];
                    });
                }
            }
            bs.debug("+  {green:Step Complete: " + item.step);
            cb();
        });
    };
}

/**
 * At this point, ALL async tasks have completed
 * @param {BrowserSync} bs
 * @returns {Function}
 */
function tasksComplete (bs) {

    return function (err) {

        if (err) {
            bs.logger.setOnce("useLevelPrefixes", true).error(err.message);
        }

        /**
         * Set active flag
         */
        bs.active = true;

        /**
         * @deprecated
         */
        bs.events.emit("init", bs);

        /**
         * This is no-longer needed as the Callback now only resolves
         * when everything (including slow things, like the tunnel) is ready.
         * It's here purely for backwards compatibility.
         * @deprecated
         */
        bs.events.emit("service:running", {
            options: bs.options,
            baseDir: bs.options.getIn(["server", "baseDir"]),
            type:    bs.options.get("mode"),
            port:    bs.options.get("port"),
            url:     bs.options.getIn(["urls", "local"]),
            urls:    bs.options.get("urls").toJS(),
            tunnel:  bs.options.getIn(["urls", "tunnel"])
        });

        /**
         * Finally, call the user-provided callback
         */
        bs.cb(null, bs);
    };
}

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
        "connector": messages.socketConnector(
            this.options.get("port"),
            this.options.get("socket").toJS(),
            this.options,
            true
        ),
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
 * @param path
 * @param props
 */
BrowserSync.prototype.serveFile = function (path, props) {

    if (this.app) {
        this.app.use(path, function (req, res) {
            res.setHeader("Content-Type", props.type);
            res.end(props.content);
        });
    }
};

/**
 * Middleware for socket connection (external usage)
 * @param port
 * @param opts
 * @returns {*}
 */
BrowserSync.prototype.getSocketConnector = function (port, opts) {

    return function (req, res) {
        res.setHeader("Content-Type", "text/javascript");
        res.end(messages.socketConnector(port, opts, null, true));
    };
};

/**
 * Socket connector as a string
 * @param {Object} opts
 * @returns {*}
 */
BrowserSync.prototype.getExternalSocketConnector = function (opts) {

    opts = this.options.get("socket").merge(opts);
    return messages.socketConnector(this.options.get("port"), opts.toJS(), null, true);
};

/**
 * Socket io as string (for embedding)
 * @returns {*}
 */
BrowserSync.prototype.getSocketIoScript = function () {

    return require("./snippet").utils.getSocketScript();
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
BrowserSync.prototype.setOption = function (name, value, opts) {

    opts = opts || {};
    this.debug("Setting Option: {cyan:%s} - {magenta:%s", name, value.toString());
    this.options = this.options.set(name, value);
    if (!opts.silent) {
        this.events.emit("options:set", {path: name, value: value, options: this.options});
    }
    return this.options;
};

/**
 * @param path
 * @param value
 * @param opts
 * @returns {Map|*|BrowserSync.options}
 */
BrowserSync.prototype.setOptionIn = function (path, value, opts) {

    opts = opts || {};
    this.debug("Setting Option: {cyan:%s} - {magenta:%s", path.join("."), value.toString());
    this.options = this.options.setIn(path, value);
    if (!opts.silent) {
        this.events.emit("options:set", {path: path, value: value, options: this.options});
    }
    return this.options;
};

/**
 * Set multiple options with mutations
 * @param fn
 * @param opts
 * @returns {Map|*}
 */
BrowserSync.prototype.setMany = function (fn, opts) {

    opts = opts || {};
    this.debug("Setting multiple Options");
    this.options = this.options.withMutations(fn);
    if (!opts.silent) {
        this.events.emit("options:set", {options: this.options.toJS()});
    }
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

    var bs = this;

    bs._reloadQueue = bs._reloadQueue || [];
    bs._reloadQueue.push(data);

    if (bs._reloadTimer) {
        return;
    }

    bs._reloadTimer = setTimeout(function () {
        if (utils.willCauseReload(
                bs._reloadQueue.map(function (item) { return item.path; }),
                bs.options.get("injectFileTypes").toJS())) {
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

    if (this.ui) {
        this.ui.server.close();
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

    this.pluginManager.plugins        = {};
    this.pluginManager.pluginOptions  = {};
    this.pluginManager.defaultPlugins = defaultPlugins;

    this._userPlugins                = [];
    this.userPlugins                 = [];
    this._reloadTimer                = undefined;
    this._reloadQueue                = undefined;

    if (_.isFunction(cb)) {
        cb(null, this);
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
    if (!_.contains(options.get("injectFileTypes").toJS(), fileExtension)) {
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
