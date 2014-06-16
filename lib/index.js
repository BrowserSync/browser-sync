#! /usr/bin/env node
"use strict";

var BrowserSync   = require("./browser-sync");
var pjson         = require("../package.json");
var defaultConfig = require("./default-config");
var utils         = require("./utils");
var cli           = require("./cli");
var init          = cli.init;
var info          = cli.info;
var options       = cli.options;

var args          = require("optimist").argv;
var argv          = process.argv;

var _             = require("lodash");
var merge         = require("opt-merger").merge;

var browserSync   = new BrowserSync();

/**
 * @param {Array|Null} files
 * @param {Object} config
 * @param {Function} [cb]
 * @returns {BrowserSync}
 */
module.exports.start = function (files, config, cb) {
    return browserSync.init(files || [], config, pjson.version, cb);
};

/**
 * Handle Command-line usage
 */
if (require.main === module) {
    init.parse(pjson.version, args, argv, function (err, data) {
        if (err) {
            utils.fail(err, {}, true);
        }
        if (data.config) {
            exports.start(data.files, data.config);
        }
        if (data.configFile) {
            info.makeConfig();
        }
    });
}

/**
 * Exposed helper method for triggering reload
 * @param [arg]
 * @returns {*}
 */
module.exports.reload = function (arg) {

    function emitReload(path) {
        browserSync.events.emit("file:changed", {
            path: path
        });
    }

    function emitBrowserReload() {
        browserSync.events.emit("browser:reload");
    }

    if (typeof arg === "string") {
        return emitReload(arg);
    }

    if (Array.isArray(arg)) {
        return arg.forEach(emitReload);
    }

    if (arg && arg.stream === true) {

        // Handle Streams here...
        var emitted = false;
        var once    = arg.once || false;

        var Transform = require("stream").Transform;
        var reload = new Transform({objectMode:true});

        reload._transform = function(file, encoding, next) {

            if (once === true && !emitted) {
                emitBrowserReload();
                emitted = true;
                this.push(file);
                return next();
            } else {
                if (once === true && emitted) {
                    return;
                }
                if (file.path) {
                    emitted    = true;
                    emitReload(file.path);
                }
            }
            this.push(file);
            next();
        };
        return reload;
    }

    return emitBrowserReload();
};

/**
 * @param {string} msg
 */
module.exports.notify = function (msg) {
    if (msg) {
        browserSync.events.emit("browser:notify", {
            message: msg
        });
    }
};

/**
 * Handle External API usage.
 * @returns {BrowserSync}
 */
module.exports.init = function () {

    var args = require("./args")(arguments);
    var userConfig = args.config;
    var cb         = args.cb;

    var config = merge(_.cloneDeep(defaultConfig), userConfig || {}, options.callbacks);

    if (!config.server && !config.proxy) {
        config.open = false;
    }

    return exports.start(config.files, config, cb);
};

/**
 * Allow plugins to be registered/overridden
 * @param {String} name
 * @param {Function} func
 * @param {Function} [cb]
 */
module.exports.use = function (name, func, cb) {
    browserSync.registerPlugin(name, func, cb);
};

/**
 * Export the emitter
 * @type {BrowserSync.events}
 */
module.exports.emitter = browserSync.events;

/**
 *
 */
module.exports.exit = function () {
    process.exit(0);
};
