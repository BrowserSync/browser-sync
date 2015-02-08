"use strict";

var _             = require("lodash");
var Immutable     = require("immutable");
var defaultConfig = require("./default-config");

/**
 * @param {Map} options
 * @returns {Map}
 */
module.exports.update = function (options) {

    return options.withMutations(function (item) {

        setScheme(item);
        setStartPath(item);
        setServerOpts(item);
        setNamespace(item);

        fixSnippetOptions(item);

        if (item.get("files") === false) {
            item.set("files", Immutable.List([]));
        }

        if (!item.get("server") && !item.get("proxy")) {
            item.set("open", false);
        }

        if (item.get("uiPort")) {
            item.setIn(["ui", "port"], item.get("uiPort"));
        }
    });
};

/**
 * @param item
 */
function setScheme (item) {
    var scheme = "http";

    if (item.getIn(["server", "https"])) {
        scheme = "https";
    }

    if (item.get("https") && !item.get("proxy") && !item.get("tunnel")) {
        scheme = "https";
    }

    item.set("scheme", scheme);
}

/**
 * @param item
 */
function setStartPath (item) {
    if (item.get("proxy")) {
        var path = item.getIn(["proxy", "path"]);
        if (path !== "/") {
            item.set("startPath", path);
        }
    }
}

/**
 * @param item
 */
function setNamespace(item) {
    var namespace = item.getIn(["socket", "namespace"]);

    if (_.isFunction(namespace)) {
        item.setIn(["socket", "namespace"], namespace(defaultConfig.socket.namespace));
    }
}

/**
 * @param item
 */
function setServerOpts(item) {
    if (item.get("server")) {
        if (item.get("directory")) {
            item.setIn(["server", "directory"], true);
        }
        if (item.get("index")) {
            item.setIn(["server", "index"], item.get("index"));
        }
    }
}

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
