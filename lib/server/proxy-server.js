"use strict";

var snippetUtils = require("./../snippet").utils;
var _            = require("lodash");
var utils        = require("./utils");

/**
 * @param {BrowserSync} bs
 * @param {String} scripts
 * @returns {*}
 */
module.exports = function createProxyServer (bs, scripts) {

    var options = bs.options;

    checkProxyTarget(options, function (err) {
        if (err) {
            bs.events.emit("config:warn", {msg: err});
        }
    });

    var opts = getOptions(bs, scripts);

    var app = require("foxy")(options.getIn(["proxy", "target"]), opts);

    return utils.getServer(app, bs.options);
};

/**
 * @param bs
 * @param scripts
 */
function getOptions (bs, scripts) {

    var options  = bs.options;

    var snippetOptions = options.get("snippetOptions").toJS();
    var rewrites = [snippetUtils.getRegex(options.get("snippet"), options.get("snippetOptions"))];

    if (bs.options.get("rewriteRules")) {
        rewrites = rewrites.concat(bs.options.get("rewriteRules").toJS());
    }

    var out = {
        rules:       rewrites,
        whitelist:   snippetOptions.whitelist,
        blacklist:   snippetOptions.blacklist,
        middleware:  options.get("middleware").push(getPluginMiddleware(bs, scripts)),
        errHandler:  function (err) {
            bs.logger.debug("{red:[proxy error]} %s", err.message);
        }
    };

    if (options.getIn(["proxy", "reqHeaders"])) {
        out.reqHeaders = options.getIn(["proxy", "reqHeaders"]);
    }

    if (options.getIn(["proxy", "cookies"])) {
        out.cookies = options.getIn(["proxy", "cookies"]);
    }

    return out;
}

/**
 * Get proxy specific middleware
 * @param bs
 * @param scripts
 * @returns {*}
 */
function getPluginMiddleware (bs, scripts) {
    return bs.pluginManager.hook("server:middleware", snippetUtils.getProxyMiddleware(scripts, bs.options.getIn(["scriptPaths", "versioned"])));
}

/**
 * @param {Object} opts
 * @param {Function} cb
 */
function checkProxyTarget (opts, cb) {

    var chunks  = [];
    var errored = false;
    var target  = opts.getIn(["proxy", "target"]);
    var scheme  = opts.get("scheme");

    function logError() {
        if (!errored) {
            cb("Proxy address not reachable - is your server running?");
            errored = true;
        }
    }

    require(scheme).get(target, function (res) {
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
