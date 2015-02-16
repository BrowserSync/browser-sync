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

        var namespaces = {};

        if (isList(initial)) {
            namespaces["core"] = initial.toJS();
        }

        if (isMap(initial)) {
            initial.map(function (value, key) {
                namespaces[key] = value;
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
