"use strict";

var _            = require("lodash");
var Immutable    = require("immutable");
var isMap        = Immutable.Map.isMap;
var isList       = Immutable.List.isList;
var snippetUtils = require("./snippet").utils;
var utils        = require("./utils");

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
                        initial = initial.push(res);
                    }
                });

            } else {
                if (_.isFunction(result)) {
                    initial = initial.push(result);
                }
            }
        }, this);

        return initial;
    },
    /**
     * @param {Array} hooks
     * @param {Map|List} initial
     * @param pluginOptions
     * @returns {any}
     */
    "files:watch": function (hooks, initial, pluginOptions) {

        var CORE               = "core";
        var namespaces         = {};
        namespaces[CORE]       = {};
        namespaces[CORE].multi = [];

        if (isList(initial) && initial.size) {

            initial.forEach(function (item) {
                if (isMap(item)) {
                    if (isList(item.get("match"))) {
                        namespaces[CORE].multi.push({match: item.get("match"), fn: item.get("fn")});
                    } else {
                        namespaces[CORE][item.get("match")] = item.get("fn");
                    }
                }
                if (_.isString(item)) {
                    namespaces[CORE][item] = true;
                }
            });
        }

        if (isMap(initial)) {
            initial.map(function (value, key) {
                namespaces[CORE][key] = value;
            });
        }

        if (pluginOptions) { // todo: use immutable data for plugin options also
            _.each(pluginOptions, function (value, key) {
                if (value && value.files) {
                    namespaces[key] = utils.makeList(value.files);
                }
            });
        }

        return Immutable.fromJS(namespaces);
    }
};
