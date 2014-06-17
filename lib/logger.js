"use strict";

var messages = require("./messages");
var utils    = require("./utils").utils;
var log      = utils.log;

var _        = require("lodash");

/**
 * Logging Callbacks
 * @type {{file:watching: "file:watching", file:reload: "file:reload", client:connected: "client:connected", open: "open"}}
 */
module.exports.callbacks = {

    "file:watching": function (options, data) {
        if (data.watcher._patterns) {
            log("info", messages.files.watching(data.watcher._patterns), options);
        }
    },
    "file:reload": function (options, data) {
        log("info", messages.files.changed(utils.resolveRelativeFilePath(data.path, data.cwd)), options);
        log("info", messages.browser[data.type](), options);
    },
    "client:connected": function (options, data) {

        var msg = messages.browser.connection(utils.getUaString(data.ua));

        if (options.logConnections) {
            log("info", msg, options, false);
        } else {
            log("debug", msg, options, false);
        }
    },
    "service:running": function (options, data) {

        var type = data.type;
        var msg;

        if (data.tunnel) {
            options.urls.tunnel = data.tunnel;
        }

        if (type === "server") {

            msg = messages.initServer(options);
        }

        if (type === "proxy") {
            msg = messages.initProxy(options, options.proxy.target, data.tunnel);
        }

        if (type === "snippet") {
            msg = messages.initSnippet(data.port, options);
        }

        log("info", msg, options, false);
    }
};

/**
 * Plugin interface - only to be called once to register all events
 */
module.exports.plugin = function () {
    return function (emitter, options) {
        _.each(exports.callbacks, function (func, event) {
            emitter.on(event, func.bind(this, options));
        });
    };
};