#! /usr/bin/env node
"use strict";

/**
 * @module BrowserSync
 */
var pjson         = require("./package.json");
var BrowserSync   = require("./lib/browser-sync");
var tfunk         = require("tfunk");
var events        = require("events");

var firstInstance = false;
var firstEmitter  = false;

function newEmitter() {
    var emitter       = new events.EventEmitter();
    emitter.setMaxListeners(20);
    return emitter;
}

function getFirstEmitter() {
    if (firstEmitter) {
        return firstEmitter;
    }

    firstEmitter = newEmitter();
    return firstEmitter;
}

/**
 * @method browserSync
 * @param {Object} [config] This is the main configuration for your BrowserSync instance and can contain any of the [available options]({{site.links.options}})
 *  If you do not pass a config an argument for configuration, BrowserSync will still run; but it will be in the `snippet` mode
 * @param {Function} [cb] If you pass a callback function, it will be called when BrowserSync has completed all setup tasks and is ready to use. This
 * is useful when you need to wait for information (for example: urls, port etc) or perform other tasks synchronously.
 * @returns {BrowserSync}
 */

/**
 * The `reload` method will inform all browsers about changed files and will either cause the browser to refresh, or inject the files where possible.
 *
 * @method reload
 * @param {String|Array|Object} [arg] The file or files to be reloaded. For
 * details and examples of Streams support, please see the [GulpJS]({{site.links.gulp}}) examples
 * @returns {*}
 */

/**
 * Helper method for browser notifications
 *
 * @method notify
 * @param {String|HTML} msg Can be a simple message such as 'Connected' or HTML
 * @param {Number} [timeout] How long the message will remain in the browser. @since 1.3.0
 */
//module.exports.notify = require("./lib/public/notify")(browserSync);

/**
 * Method to pause file change events
 *
 * @method pause
 */
module.exports.pause = require("./lib/public/pause")(browserSync);

/**
 * Method to resume paused watchers
 *
 * @method resume
 */
module.exports.resume = require("./lib/public/resume")(browserSync);

/**
 * Register a plugin. Must implement at least a 'plugin' method that returns a
 * callable function.
 *
 * @method use
 * @param {String} name The name of the plugin
 * @param {Object} module The object to be `required`.
 * @param {Function} [cb] A callback function that will return any errors.
 */
//module.exports.use = browserSync.registerPlugin.bind(browserSync);

/**
 * The internal Event Emitter used by the running BrowserSync instance (if there is one).
 * You can use this to emit your own events, such as changed files, logging etc.
 *
 * @property emitter
 * @type Events.EventEmitter
 */

/**
 * A simple true/false flag that you can use to determine if there's a currently-running BrowserSync instance.
 *
 * @property active
 */

function noop(name) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        if (firstInstance) {
            firstInstance[name].apply(firstInstance, args);
            return firstInstance;
        } else {
            deprecated(name);
        }
    }
}

function deprecated(name) {
    console.log(tfunk("{yellow:Warning:} This functionality will change in BrowserSync 2.0. You'll have to first call browserSync.create() before {cyan:`.%s()`"), name);
}

module.exports = function () {
    var args = Array.prototype.slice.call(arguments);
    firstInstance = create(getFirstEmitter());
    firstInstance.init.apply(null, args);
    return firstInstance;
};

module.exports.use     = noop("use");
module.exports.reload  = noop("reload");
module.exports.notify  = noop("notify");
module.exports.exit    = noop("exit");

/**
 *
 */
Object.defineProperty(module.exports, "emitter", {
    get: function () {
        if (!firstEmitter) {
            firstEmitter = newEmitter();
            return firstEmitter;
        }
        return false;
    }
});

/**
 *
 */
Object.defineProperty(module.exports, "active", {
    get: function () {
        return browserSync.active;
    }
});

/**
 * A simple true/false flag to determine if the current instance is paused
 *
 * @property paused
 */
Object.defineProperty(module.exports, "paused", {
    get: function () {
        return browserSync.paused;
        if (firstInstance) {
            return firstInstance.active;
        }
        return false;
    }
});

/**
 * @returns {{init: *}}
 */
function create (emitter) {

    var browserSync = new BrowserSync(emitter || newEmitter());

    var publicApi = {
        init:    require("./lib/public/init")(browserSync, pjson),
        exit:    require("./lib/public/exit")(browserSync),
        notify:  require("./lib/public/notify")(browserSync),
        reload:  require("./lib/public/reload")(browserSync.events),
        cleanup: browserSync.cleanup.bind(browserSync),
        emitter: browserSync.events,
        use:     browserSync.registerPlugin.bind(browserSync)
    };

    Object.defineProperty(publicApi, "active", {
        get: function () {
            return browserSync.active;
        }
    });

    return publicApi;
}

module.exports.create = create;