"use strict";

var _ = require("lodash");
var snippetUtils = require("./snippet").utils;

module.exports = {

    /**
     * @this {BrowserSync}
     * @returns {String}
     */
    "client:js": function (data) {

        var js  = snippetUtils.getClientJs(data.port, data.options);

        var keys = Object.keys(this.plugins);
        var hook = "client:js";

        return keys.reduce(function (joined, key) {

            var pluginHook = this.getHook(key, hook);

            if (pluginHook) {
                return joined += pluginHook(this);
            }

            return joined;

        }.bind(this), js);
    },
    /**
     * @this {BrowserSync}
     * @returns {Array}
     */
    "client:events": function () {

        var keys   = Object.keys(this.plugins);
        var hook   = "client:events";
        var events = this.clientEvents;

        keys.forEach(function (key) {
            if (this.getHook(key, hook)) {
                events.push(this.getHook(key, hook)(this));
            }
        }, this);

        return events;
    },
    /**
     * @returns {Array}
     */
    "server:middleware": function () {
        return arrayPush(this, "server:middleware", this.options.server.middleware);
    }
};

/**
 * @param context
 * @param hook
 * @param initial
 * @returns {*|Array}
 */
function arrayPush(context, hook, initial) {

    var arr = initial || [];

    var keys   = Object.keys(context.plugins);

    keys.forEach(function (key) {
        if (context.getHook(key, hook)) {

            var item = context.getHook(key, hook)(context);

            if (Array.isArray(item)) {
                item.forEach(function (single) {
                    add(arr, single);
                });
            } else {
                add(item);
            }
        }
    });

    function add(arr, item) {
        if (_.isFunction(item)) {
            arr.push(item);
        }
    }

    return arr;
}