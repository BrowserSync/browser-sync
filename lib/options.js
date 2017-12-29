"use strict";

var _ = require("./lodash.custom");
var Immutable = require("immutable");
var defaultConfig = require("./default-config");

/**
 * Move top-level ws options to proxy.ws
 * This is to allow it to be set from the CLI
 * @param incoming
 */
export function setProxyWs(incoming) {
    if (incoming.get("ws") && incoming.get("mode") === "proxy") {
        return incoming.setIn(["proxy", "ws"], true);
    }
    return incoming;
}

/**
 * @param item
 */
export function setOpen(item) {
    return item.update('open', function(open) {
        if (item.get("mode") === "snippet") {
            if (open !== "ui" && open !== "ui-external") {
                return false;
            }
        }
        return open;
    });
}

/**
 * Set the running mode
 * @param incoming
 */
export function setMode(incoming) {
    return incoming.set(
        "mode",
        (function() {
            if (incoming.get("server")) {
                return "server";
            }
            if (incoming.get("proxy")) {
                return "proxy";
            }
            return "snippet";
        })()
    );
}

/**
 * @param incoming
 */
export function setScheme(incoming) {
    var scheme = "http";

    if (incoming.getIn(["server", "https"])) {
        scheme = "https";
    }

    if (incoming.get("https")) {
        scheme = "https";
    }

    if (incoming.getIn(["proxy", "url", "protocol"])) {
        if (incoming.getIn(["proxy", "url", "protocol"]) === "https:") {
            scheme = "https";
        }
    }

    return incoming.set("scheme", scheme);
}

/**
 * @param incoming
 */
export function setStartPath(incoming) {
    if (incoming.get("proxy")) {
        var path = incoming.getIn(["proxy", "url", "path"]);
        if (path !== "/") {
            return incoming.set("startPath", path);
        }
    }
    return incoming;
}

/**
 * @param item
 */
export function setNamespace(item) {
    var namespace = item.getIn(["socket", "namespace"]);

    if (_.isFunction(namespace)) {
        return item.setIn(
            ["socket", "namespace"],
            namespace(defaultConfig.socket.namespace)
        );
    }
    return item;
}

/**
 * @param item
 */
export function setServerOpts(item) {
    if (!item.get("server")) {
        return item;
    }
    var indexarg =
        item.getIn(["server", "index"]) ||
        "index.html";
    var optPath = ["server", "serveStaticOptions"];

    if (!item.getIn(optPath)) {
        return item.setIn(
            optPath,
            Immutable.Map({
                index: indexarg
            })
        );
    }
    if (!item.hasIn(optPath.concat(["index"]))) {
        return item.setIn(optPath.concat(["index"]), indexarg);
    }

    return item;
}

export function liftExtensionsOptionFromCli(item) {
    // cli extensions
    var optPath = ["server", "serveStaticOptions"];
    if (item.get("extensions")) {
        return item.setIn(optPath.concat(["extensions"]), item.get("extensions"));
    }
    return item;
}

/**
 * Back-compat fixes for rewriteRules being set to a boolean
 */
export function fixRewriteRules(item) {
    return item.update("rewriteRules", function(rr) {
        return Immutable.List([])
            .concat(rr)
            .filter(Boolean);
    });
}

export function fixSnippetIgnorePaths(item) {
    var ignorePaths = item.getIn(["snippetOptions", "ignorePaths"]);

    if (ignorePaths) {
        if (_.isString(ignorePaths)) {
            ignorePaths = [ignorePaths];
        }
        ignorePaths = ignorePaths.map(ensureSlash);
        return item.setIn(
            ["snippetOptions", "blacklist"],
            Immutable.List(ignorePaths)
        );
    }
    return item;
}

export function fixSnippetIncludePaths(item) {
    var includePaths = item.getIn(["snippetOptions", "whitelist"]);
    if (includePaths) {
        includePaths = includePaths.map(ensureSlash);
        return item.setIn(
            ["snippetOptions", "whitelist"],
            Immutable.List(includePaths)
        );
    }
    return item;
}


/**
 * Enforce paths to begin with a forward slash
 */
function ensureSlash(item) {
    if (item[0] !== "/") {
        return "/" + item;
    }
    return item;
}

/**
 *
 */
export function setMiddleware(item) {
    var mw = getMiddlwares(item);
    return item.set("middleware", mw);
}

/**
 * top-level option, or given as part of the proxy/server option
 * @param item
 * @returns {*}
 */
function getMiddlwares(item) {
    var mw = item.get("middleware");
    var serverMw = item.getIn(["server", "middleware"]);
    var proxyMw = item.getIn(["proxy", "middleware"]);

    var list = Immutable.List([]);

    if (mw) {
        return listMerge(list, mw);
    }

    if (serverMw) {
        return listMerge(list, serverMw);
    }

    if (proxyMw) {
        return listMerge(list, proxyMw);
    }

    return list;
}

/**
 * @param item
 * @returns {*}
 */
function isList(item) {
    return Immutable.List.isList(item);
}

/**
 * @param list
 * @param item
 * @returns {*}
 */
function listMerge(list, item) {
    if (_.isFunction(item)) {
        list = list.push(item);
    }

    if (isList(item) && item.size) {
        list = list.merge(item);
    }

    return list;
}

/**
 * @param item
 * @returns {*}
 */
export function setUiPort(item) {
    if (item.get("uiPort")) {
        return item.setIn(["ui", "port"], item.get("uiPort"));
    }
    return item;
}
