// @ts-check
import chalk from "chalk";
import EE from "easy-extender";

import hooks from "./hooks";
import asyncTasks from "./async-tasks";
import config from "./config";
import connectUtils from "./connect-utils";
import * as utils from "./utils";
import * as logger from "./logger";
import { isFunction, toArray } from "./underbar";

var eachSeries = utils.eachSeries;

/**
 * Required internal plugins.
 * Any of these can be overridden by deliberately
 * causing a name-clash.
 */
var defaultPlugins = {
    logger: logger,
    socket: require("./sockets"),
    "file:watcher": require("./file-watcher"),
    server: require("./server"),
    tunnel: require("./tunnel"),
    "client:script": require("browser-sync-client"),
    UI: require("browser-sync-ui")
};

class BrowserSync {
    /** @type {undefined | any} */
    ui;
    /** @type {undefined | any} */
    server;
    /** @type {import("immutable").Map<string, any>} */
    options;
    /**
     * @constructor
     */
    constructor(emitter) {
        var bs = this;

        bs.cwd = process.cwd();
        bs.active = false;
        bs.paused = false;
        bs.config = config;
        bs.utils = utils;
        bs.events = bs.emitter = emitter;

        bs._userPlugins = [];
        bs._reloadQueue = [];
        bs._cleanupTasks = [];
        bs._browserReload = false;

        // Plugin management
        bs.pluginManager = new EE(defaultPlugins, hooks);
        /**
         * @returns {BrowserSync.options}
         */
        this.getLogger = logger.getLogger;
    }

    /**
     * Call a user-options provided callback
     * @param name
     */
    callback(name) {
        var bs = this;
        var cb = bs.options.getIn(["callbacks", name]);

        if (isFunction(cb)) {
            cb.apply(
                // @ts-expect-error
                bs.publicInstance,
                toArray(arguments).slice(1)
            );
        }
    }

    /**
     * @param {import("immutable").Map} options
     * @param {Function} cb
     * @returns {BrowserSync}
     */
    init(options, cb) {
        /**
         * Safer access to `this`
         * @type {BrowserSync}
         */
        var bs = this;

        /**
         * Set user-provided callback, or assign a noop
         * @type {Function}
         */
        bs.cb = cb || utils.defaultCallback;

        /**
         * Verify provided config.
         * Some options are not compatible and will cause us to
         * end the process.
         */
        if (!utils.verifyConfig(options, bs.cb)) {
            return;
        }

        /**
         * Save a reference to the original options
         * @type {import("immutable").Map<string, any>}
         */
        bs._options = options;

        /**
         * Set additional options that depend on what the
         * user may of provided
         * @type {import("immutable").Map<string, any>}
         */
        bs.options = options;

        /**
         * Kick off default plugins.
         */
        bs.pluginManager.init();

        /**
         * Create a base logger & debugger.
         */
        bs.logger = bs.pluginManager.get("logger")(bs.events, bs);
        bs.debugger = bs.logger.clone({ useLevelPrefixes: true });
        bs.debug = bs.debugger.debug;

        /**
         * Run each setup task in sequence
         */
        eachSeries(asyncTasks, taskRunner(bs), tasksComplete(bs));

        return this;
    }

    /**
     * @param module
     * @param opts
     * @param cb
     */
    registerPlugin(module, opts, cb) {
        var bs = this;

        bs.pluginManager.registerPlugin(module, opts, cb);

        if (module["plugin:name"]) {
            bs._userPlugins.push(module);
        }
    }

    /**
     * Get a plugin by name
     * @param name
     */
    getUserPlugin(name) {
        var bs = this;

        var items = bs.getUserPlugins(function(item) {
            return item["plugin:name"] === name;
        });

        if (items && items.length) {
            return items[0];
        }

        return false;
    }

    /**
     * @param {Function} [filter]
     */
    getUserPlugins(filter) {
        var bs = this;

        filter =
            filter ||
            function() {
                return true;
            };

        /**
         * Transform Plugins option
         */
        // @ts-expect-error
        bs.userPlugins = bs._userPlugins.filter(filter).map(function(plugin) {
            return {
                name: plugin["plugin:name"],
                active: plugin._enabled,
                opts: bs.pluginManager.pluginOptions[plugin["plugin:name"]]
            };
        });

        return bs.userPlugins;
    }

    /**
     * Get middleware
     * @returns {*}
     */
    getMiddleware(type) {
        var types = {
            connector: connectUtils.socketConnector(this.options)
        };

        if (type in types) {
            return function(req, res) {
                res.setHeader("Content-Type", "text/javascript");
                res.end(types[type]);
            };
        }
    }

    serveFile(path, props) {
        var bs = this;
        // @ts-expect-error
        var mode = bs.options.get("mode");
        var entry = {
            handle: function(req, res) {
                res.setHeader("Content-Type", props.type);
                res.end(props.content);
            },
            id: "Browsersync - " + _serveFileCount++,
            route: path
        };

        bs._addMiddlewareToStack(entry);
    }

    /**
     * Add middlewares on the fly
     */
    _addMiddlewareToStack(entry) {
        var bs = this;

        /**
         * additional middlewares are always appended -1,
         * this is to allow the proxy middlewares to remain,
         * and the directory index to remain in serveStatic/snippet modes
         */
        // @ts-expect-error
        bs.app.stack.splice(bs.app.stack.length - 1, 0, entry);
    }

    addMiddleware(route, handle, opts) {
        var bs = this;

        // @ts-expect-error
        if (!bs.app) {
            return;
        }

        opts = opts || {};

        if (!opts.id) {
            opts.id = "bs-mw-" + _addMiddlewareCount++;
        }

        if (route === "*") {
            route = "";
        }

        var entry = {
            id: opts.id,
            route: route,
            handle: handle
        };

        if (opts.override) {
            entry.override = true;
        }

        bs.options = bs.options.update("middleware", function(mw) {
            if (bs.options.get("mode") === "proxy") {
                return mw.insert(mw.size - 1, entry);
            }
            return mw.concat(entry);
        });

        bs.resetMiddlewareStack();
    }

    /**
     * Remove middlewares on the fly
     * @param {String} id
     */
    removeMiddleware(id) {
        var bs = this;

        // @ts-expect-error
        if (!bs.app) {
            return;
        }

        bs.options = bs.options.update("middleware", function(mw) {
            return mw.filter(function(mw) {
                return mw.id !== id;
            });
        });

        bs.resetMiddlewareStack();
    }

    /**
     * Middleware for socket connection (external usage)
     * @param opts
     * @returns {*}
     */
    getSocketConnector(opts) {
        var bs = this;

        return function(req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(bs.getExternalSocketConnector(opts));
        };
    }

    /**
     * Socket connector as a string
     * @param {Object} opts
     * @returns {*}
     */
    getExternalSocketConnector(opts) {
        var bs = this;

        return connectUtils.socketConnector(
            bs.options.withMutations(function(item) {
                item.set("socket", item.get("socket").merge(opts));
                if (!bs.options.getIn(["proxy", "ws"])) {
                    item.set("mode", "snippet");
                }
            })
        );
    }

    /**
     * Callback helper
     * @param name
     */
    getOption(name) {
        this.debug("Getting option: {magenta:%s", name);
        return this.options.get(name);
    }

    /**
     * Callback helper
     * @param path
     */
    getOptionIn(path) {
        this.debug("Getting option via path: {magenta:%s", path);
        return this.options.getIn(path);
    }

    /**
     * @returns {import("immutable").Map<string, any>}
     */
    getOptions() {
        return this.options;
    }

    /**
     * @param {String} name
     * @param {*} value
     */
    setOption(name, value, opts) {
        var bs = this;

        opts = opts || {};

        bs.debug("Setting Option: {cyan:%s} - {magenta:%s", name, value.toString());

        bs.options = bs.options.set(name, value);

        if (!opts.silent) {
            bs.events.emit("options:set", {
                path: name,
                value: value,
                options: bs.options
            });
        }
        return this.options;
    }

    /**
     * @param path
     * @param value
     * @param opts
     */
    setOptionIn(path, value, opts) {
        var bs = this;

        opts = opts || {};

        bs.debug("Setting Option: {cyan:%s} - {magenta:%s", path.join("."), value.toString());
        bs.options = bs.options.setIn(path, value);
        if (!opts.silent) {
            bs.events.emit("options:set", {
                path: path,
                value: value,
                options: bs.options
            });
        }
        return bs.options;
    }

    /**
     * Set multiple options with mutations
     * @param fn
     * @param opts
     * @returns {Map|*}
     */
    setMany(fn, opts) {
        var bs = this;

        opts = opts || {};

        bs.debug("Setting multiple Options");
        bs.options = bs.options.withMutations(fn);
        if (!opts.silent) {
            bs.events.emit("options:set", { options: bs.options.toJS() });
        }
        return this.options;
    }

    addRewriteRule(rule) {
        var bs = this;

        bs.options = bs.options.update("rewriteRules", function(rules) {
            return rules.concat(rule);
        });

        bs.resetMiddlewareStack();
    }

    removeRewriteRule(id) {
        var bs = this;
        bs.options = bs.options.update("rewriteRules", function(rules) {
            return rules.filter(function(rule) {
                return rule.id !== id;
            });
        });

        bs.resetMiddlewareStack();
    }

    setRewriteRules(rules) {
        var bs = this;
        bs.options = bs.options.update("rewriteRules", function(_) {
            return rules;
        });

        bs.resetMiddlewareStack();
    }

    /**
     * Add a new rewrite rule to the stack
     */
    resetMiddlewareStack() {
        var bs = this;
        // @ts-expect-error
        var middlewares = require("./server/utils").getMiddlewares(bs, bs.options);

        // @ts-expect-error
        bs.app.stack = middlewares;
    }

    /**
     * @param fn
     */
    registerCleanupTask(fn) {
        this._cleanupTasks.push(fn);
    }

    /**
     * Instance Cleanup
     */
    cleanup(cb) {
        var bs = this;
        if (!bs.active) {
            return;
        }

        // Remove all event listeners
        if (bs.events) {
            bs.debug("Removing event listeners...");
            bs.events.removeAllListeners();
        }

        // Close any core file watchers
        // @ts-expect-error
        if (bs.watchers) {
            // @ts-expect-error
            Object.keys(bs.watchers).forEach(function(key) {
                // @ts-expect-error
                bs.watchers[key].watchers.forEach(function(watcher) {
                    watcher.close();
                });
            });
        }

        // Run any additional clean up tasks
        bs._cleanupTasks.forEach(function(fn) {
            if (isFunction(fn)) {
                fn(bs);
            }
        });

        // Reset the flag
        bs.debug("Setting {magenta:active: false");
        bs.active = false;
        bs.paused = false;

        bs.pluginManager.plugins = {};
        bs.pluginManager.pluginOptions = {};
        bs.pluginManager.defaultPlugins = defaultPlugins;

        bs._userPlugins = [];
        bs.userPlugins = [];
        bs._reloadTimer = undefined;
        bs._reloadQueue = [];
        bs._cleanupTasks = [];

        if (isFunction(cb)) {
            cb(null, bs);
        }
    }
}

/**
 * Run 1 setup task.
 * Each task is a pure function.
 * They can return options or instance properties to set,
 * but they cannot set them directly.
 * @param {BrowserSync} bs
 * @returns {Function}
 */
function taskRunner(bs) {
    return function(item, cb) {
        bs.debug("-> %s", chalk.yellow("Starting Step: " + item.step));

        /**
         * Execute the current task.
         */
        item.fn(bs, executeTask);

        function executeTask(err, out) {
            /**
             * Exit early if any task returned an error.
             */
            if (err) {
                return cb(err);
            }

            /**
             * Act on return values (such as options to be set,
             * or instance properties to be set
             */
            if (out) {
                handleOut(bs, out);
            }

            bs.debug("+  %s", chalk.green("Step Complete: " + item.step));

            cb();
        }
    };
}

/**
 * @param bs
 * @param out
 */
function handleOut(bs, out) {
    /**
     * Set a single/many option.
     */
    if (out.options) {
        setOptions(bs, out.options);
    }

    /**
     * Any options returned that require path access?
     */
    if (out.optionsIn) {
        out.optionsIn.forEach(function(item) {
            bs.setOptionIn(item.path, item.value);
        });
    }

    /**
     * Any instance properties returned?
     */
    if (out.instance) {
        Object.keys(out.instance).forEach(function(key) {
            bs[key] = out.instance[key];
        });
    }
}

/**
 * Update the options Map
 * @param bs
 * @param options
 */
function setOptions(bs, options) {
    /**
     * If multiple options were set, act on the immutable map
     * in an efficient way
     */
    if (Object.keys(options).length > 1) {
        bs.setMany(function(item) {
            Object.keys(options).forEach(function(key) {
                item.set(key, options[key]);
                return item;
            });
        });
    } else {
        Object.keys(options).forEach(function(key) {
            bs.setOption(key, options[key]);
        });
    }
}

/**
 * At this point, ALL async tasks have completed
 * @param {BrowserSync} bs
 * @returns {Function}
 */
function tasksComplete(bs) {
    return function(err) {
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
            type: bs.options.get("mode"),
            port: bs.options.get("port"),
            url: bs.options.getIn(["urls", "local"]),
            urls: bs.options.get("urls").toJS(),
            tunnel: bs.options.getIn(["urls", "tunnel"])
        });

        /**
         * Call any option-provided callbacks
         */
        bs.callback("ready", null, bs);

        /**
         * Finally, call the user-provided callback given as last arg
         */
        bs.cb(null, bs);
    };
}

/**
 * Shortcut for pushing a file-serving middleware
 * onto the stack
 * @param {String} path
 * @param {{type: string, content: string}} props
 */
var _serveFileCount = 0;

var _addMiddlewareCount = 0;

export default BrowserSync;
