import {BsTempOptions, TransformResult} from "./cli/cli-options";

const _ = require("./lodash.custom");
import * as Immutable from "immutable";
import * as defaultConfig from "./default-config";

/**
 * Move top-level ws options to proxy.ws
 * This is to allow it to be set from the CLI
 * @param incoming
 */
export function setProxyWs(incoming: BsTempOptions): TransformResult {
    if (incoming.get("ws") && incoming.get("mode") === "proxy") {
        return [incoming.setIn(["proxy", "ws"], true), []];
    }
    return [incoming, []];
}

/**
 * @param incoming
 */
export function setOpen(incoming: BsTempOptions): TransformResult {
    return [incoming.update('open', function(open) {
        if (incoming.get("mode") === "snippet") {
            if (open !== "ui" && open !== "ui-external") {
                return false;
            }
        }
        return open;
    }), []];
}

/**
 * Set the running mode
 * @param incoming
 */
export function setMode(incoming: BsTempOptions): TransformResult {
    const output = incoming.set(
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
    return [output, []];
}

/**
 * @param incoming
 */
export function setScheme(incoming: BsTempOptions): TransformResult {
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

    return [incoming.set("scheme", scheme), []];
}

/**
 * @param incoming
 */
export function setStartPath(incoming: BsTempOptions): TransformResult {
    if (incoming.get("proxy")) {
        var path = incoming.getIn(["proxy", "url", "path"]);
        if (path !== "/") {
            return [incoming.set("startPath", path), []];
        }
    }
    return [incoming, []];
}

/**
 * @param incoming
 */
export function setNamespace(incoming: BsTempOptions): TransformResult {
    var namespace = incoming.getIn(["socket", "namespace"]);

    if (_.isFunction(namespace)) {
        return [incoming.setIn(
            ["socket", "namespace"],
            namespace((defaultConfig.socket as any).namespace)
        ), []];
    }
    return [incoming, []];
}

/**
 * @param incoming
 */
export function setServerOpts(incoming: BsTempOptions): TransformResult {
    if (!incoming.get("server")) {
        return [incoming, []];
    }
    var indexarg =
        incoming.getIn(["server", "index"]) ||
        "index.html";
    var optPath = ["server", "serveStaticOptions"];

    if (!incoming.getIn(optPath)) {
        return [incoming.setIn(
            optPath,
            Immutable.Map({
                index: indexarg
            })
        ), []];
    }
    if (!incoming.hasIn(optPath.concat(["index"]))) {
        return [incoming.setIn(optPath.concat(["index"]), indexarg), []];
    }

    return [incoming, []];
}

export function liftExtensionsOptionFromCli(incoming: BsTempOptions): TransformResult {
    // cli extensions
    var optPath = ["server", "serveStaticOptions"];
    if (incoming.get("extensions")) {
        return [incoming.setIn(optPath.concat(["extensions"]), incoming.get("extensions")), []];
    }
    return [incoming, []];
}

/**
 * Back-compat fixes for rewriteRules being set to a boolean
 */
export function fixRewriteRules(incoming: BsTempOptions): TransformResult {
    return [incoming.update("rewriteRules", function(rr) {
        return Immutable.List([])
            .concat(rr)
            .filter(Boolean);
    }), []];
}

export function fixSnippetIgnorePaths(incoming: BsTempOptions): TransformResult {
    var ignorePaths = incoming.getIn(["snippetOptions", "ignorePaths"]);

    if (ignorePaths) {
        if (_.isString(ignorePaths)) {
            ignorePaths = [ignorePaths];
        }
        ignorePaths = ignorePaths.map(ensureSlash);
        return [incoming.setIn(
            ["snippetOptions", "blacklist"],
            Immutable.List(ignorePaths)
        ), []];
    }
    return [incoming,[]];
}

export function fixSnippetIncludePaths(incoming: BsTempOptions): TransformResult {
    var includePaths = incoming.getIn(["snippetOptions", "whitelist"]);
    if (includePaths) {
        includePaths = includePaths.map(ensureSlash);
        return [incoming.setIn(
            ["snippetOptions", "whitelist"],
            Immutable.List(includePaths)
        ), []];
    }
    return [incoming, []];
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
export function setMiddleware(incoming: BsTempOptions): TransformResult {
    var mw = getMiddlwares(incoming);
    return [incoming.set("middleware", mw), []];
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
 * @param incoming
 * @returns {*}
 */
export function setUiPort(incoming: BsTempOptions): TransformResult {
    if (incoming.get("uiPort")) {
        return [incoming.setIn(["ui", "port"], incoming.get("uiPort")), []];
    }
    return [incoming, []];
}
