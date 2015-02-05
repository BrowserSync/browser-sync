"use strict";

var snippetUtils = require("./../snippet").utils;
var _            = require("lodash");
var foxy         = require("foxy");

/**
 * @param {BrowserSync} bs
 * @param {String} scripts
 * @returns {*}
 */
module.exports = function createProxyServer (bs, scripts) {

    var options = bs.options;

    checkProxyTarget(options.get("proxy"), function (err) {
        if (err) {
            bs.events.emit("config:warn", {msg: err});
        }
    });

    var mw       = [snippetUtils.getProxyMiddleware(scripts, options.getIn(["scriptPaths", "versioned"]))];
    var pluginMw = bs.pluginManager.hook("server:middleware");

    if (pluginMw.length) {
        mw = mw.concat(pluginMw);
    }

    var snippetOptions = options.get("snippetOptions").toJS();
    var foxyServer = foxy(options.getIn(["proxy", "target"]), {
            rules:       snippetUtils.getRegex(options.get("snippet"), options.get("snippetOptions")),
            whitelist:   snippetOptions.whitelist,
            blacklist:   snippetOptions.blacklist,
            middleware:  mw,
            errHandler:  function (err) {
                bs.logger.debug("{red:[proxy error]} %s", err.message);
            }
        }
    );

    return {
        server: foxyServer,
        app: foxyServer.app
    };
};

/**
 * @param {Object} proxy
 * @param {Function} cb
 */
function checkProxyTarget (proxy, cb) {

    var chunks  = [];
    var errored = false;

    function logError() {
        if (!errored) {
            cb("Proxy address not reachable - is your server running?");
            errored = true;
        }
    }

    require("http").get(proxy.get("target"), function (res) {
        res.on("data", function (data) {
            chunks.push(data);
        });
    }).on("error", function (err) {
        if (_.contains(["ENOTFOUND", "ECONNREFUSED"], err.code)) {
            logError();
        }
    }).on("close", function () {
        if (!chunks.length) {
            logError();
        }
    });
}
