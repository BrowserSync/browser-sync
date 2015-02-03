"use strict";

var Immutable = require("immutable");
var _         = require("lodash");
var merge     = require("../cli/cli-options").merge;
var tfunk     = require("eazy-logger").compile;

/**
 * @param {BrowserSync} browserSync
 * @param {String} [name]
 * @param {Object} pjson
 * @returns {Function}
 */
module.exports = function (browserSync, name, pjson) {

    return function () {

        if (browserSync.active) {
            return console.log(tfunk("Instance: {yellow:%s} is already running!"), name);
        }

        var args = require("../args")(Array.prototype.slice.call(arguments));

        var config = merge(args.config)
            .withMutations(function (item) {

                if (!item.get("server") && !item.get("proxy")) {
                    item.set("open", false);
                }

                item.set("version", pjson.version);

                if (item.get("files") === false) {
                    item.set("files", Immutable.List([]));
                }

                // Promote any url paths given to proxy to
                // startPath option
                if (item.get("proxy")) {
                    var path = item.getIn(["proxy", "path"]);
                    if (path !== "/") {
                        item.set("startPath", path);
                    }
                }
                fixSnippetOptions(item);
            });

        return browserSync.init(config, args.cb);
    };
};

/**
 * Back-compat options for snippetOptions.ignorePaths
 */
function fixSnippetOptions (item) {

    var ignorePaths  = item.getIn(["snippetOptions", "ignorePaths"]);
    var includePaths = item.getIn(["snippetOptions", "whitelist"]);

    if (ignorePaths) {
        if (_.isString(ignorePaths)) {
            ignorePaths = [ignorePaths];
        }
        ignorePaths = ignorePaths.map(ensureSlash);
        item.setIn(["snippetOptions", "blacklist"], Immutable.List(ignorePaths));
    }
    if (includePaths) {
        includePaths = includePaths.map(ensureSlash);
        item.setIn(["snippetOptions", "whitelist"], Immutable.List(includePaths));
    }
}

/**
 * Enforce paths to begin with a forward slash
 */
function ensureSlash (item) {
    if (item[0] !== "/") {
        return "/" + item;
    }
    return item;
}
