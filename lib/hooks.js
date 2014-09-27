"use strict";

var _ = require("lodash");
var snippetUtils = require("./snippet").utils;

module.exports = {

    /**
     *
     * @this {BrowserSync}
     * @returns {String}
     */
    "client:js": function (hooks, data) {

        var js  = snippetUtils.getClientJs(data.port, data.options);

        return hooks.reduce(function (joined, hook) {
            return joined += hook;
        }, js);
    },
    /**
     * @this {BrowserSync}
     * @returns {Array}
     */
    "client:events": function (hooks, clientEvents) {

        hooks.forEach(function (hook) {

            var result = hook(this);

            if (Array.isArray(result)) {
                clientEvents = _.union(clientEvents, result);
            } else {
                clientEvents.push(result);
            }
        }, this);

        return clientEvents;
    },
    /**
     * @returns {Array}
     */
    "server:middleware": function (hooks, initial) {

        initial = initial || [];

        _.each(hooks, function (hook) {
            var result = hook(this);
            if (Array.isArray(result)) {
                result.forEach(function (res) {
                    if (_.isFunction(res)) {
                        initial.push(res);
                    }
                });
            } else {
                if (_.isFunction(result)) {
                    initial.push(result);
                }
            }
        }, this);

        return initial;
    },
    /**
     * Allow plugins to have their own watchers
     * @param hooks
     * @param bs
     * @param obj
     * @returns {{core: *}}
     */
    "files:watch": function (hooks, bs, obj) {

        var added = false;

        var namespaces = {};

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

        if (bs.pluginManager.pluginOptions) {
            _.each(bs.pluginManager.pluginOptions, function (value, key) {
                if (value && value.files) {
                    namespaces[key] = value.files;
                }
            }, this);
        }

        return namespaces;
    }
};
