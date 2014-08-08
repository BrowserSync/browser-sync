"use strict";

var _ = require("lodash");
var snippetUtils = require("./snippet").utils;

module.exports = {

    /**
     *
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

            var hookItem = this.getHook(key, hook);

            if (hookItem) {

                var result = this.getHook(key, hook)(this);

                if (Array.isArray(result)) {
                    events = _.union(events, result);
                } else {
                    events.push(result);
                }
            }
        }, this);

        return events;
    },
    /**
     * @returns {Array}
     */
    "server:middleware": function (initial) {
        return arrayPush(this, "server:middleware", initial);
    },
    /**
     * Allow plugins to have their own watchers
     * @param obj
     * @returns {{core: *}}
     */
    "files:watch": function (obj) {

        var keys = Object.keys(this.plugins);
        var hook = "files:watch";
        var added = false;

        var namespaces = {};

        if (_.isString(obj)) {
            namespaces["core"] = obj;
        }

        if (Array.isArray(obj)) {
            if (obj.length) {
                namespaces["core"] = obj;
                if (obj.length === 1) {
                    added = true;
                }
            }
        }

        if (!added && Object.keys(obj).length) {
            _.each(obj, function (val, key) {
                namespaces[key] = val;
            });
        }

        if (this.pluginOptions) {
            _.each(this.pluginOptions, function (value, key) {
                if (value && value.files) {
                    namespaces[key] = value.files;
                }
            }, this);
        }

        return namespaces;
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
                    add(single);
                });
            } else {
                add(item);
            }
        }
    });

    function add(item) {
        if (_.isFunction(item)) {
            arr.push(item);
        }
    }

    return arr;
}