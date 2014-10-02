var respMod   = require("resp-modifier");
var httpProxy = require("http-proxy");
var http      = require("http");

var utils     = require("./lib/utils");
var cache     = require("./lib/cache");

/**
 * @param opts
 * @param proxy
 * @param [additionalRules]
 * @param [additionalMiddleware]
 * @returns {*}
 */
function init(opts, proxy, additionalRules, additionalMiddleware, errHandler) {
    var proxyHost = proxy.host + ":" + proxy.port;
    var proxyServer = httpProxy.createProxyServer({
        secure: false
    });
    var hostHeader  = utils.getProxyHost(opts);

    if (!errHandler) {
        errHandler = function (err) {
            console.log(err.message);
        };
    }

    var middleware  = respMod({
        rules: getRules()
    });

    var server = http.createServer(function(req, res) {
        var cacheResponse = cache.get(req.url);
        if (cacheResponse) {
            res.writeHead(cacheResponse.code, cacheResponse.headers);
            res.write(cacheResponse.body);
            res.end();
        } else {
            var next = function () {
                utils.unzipRequestMiddleware(req, res, function() {
                    proxyServer.web(req, res, {
                        target: opts.target,
                        headers: {
                            host: hostHeader,
                            "accept-encoding": "identity"
                        }
                    });
                });
            };

            if (additionalMiddleware) {
                cache.cacheMiddleware(req, res, function() {
                    additionalMiddleware(req, res, function (success) {
                        if (success) {
                            return;
                        }
                        utils.handleIe(req);
                        middleware(req, res, next);
                    });
                });
            } else {
                cache.cacheMiddleware(req, res, function() {
                    utils.handleIe(req);
                    middleware(req, res, next);
                });
            }
        }
    }).on("error", errHandler);

    // Handle proxy errors
    proxyServer.on("error", errHandler);

    // Remove headers
    proxyServer.on("proxyRes", function (res, originalReq, originalRes) {
        if (res.statusCode === 301) {
            res.statusCode = 302;
        }
        if (res.statusCode === 302) {
            res.headers.location = utils.handleRedirect(res.headers.location, opts, proxyHost);
        }

        // No caching
        res.headers["cache-control"] = "no-cache";
        if (utils.isContentTypeTextHtml(res.headers["content-type"]) && (res.headers["content-encoding"] === "gzip" || res.headers["content-encoding"] === "deflate")) {
            delete res.headers["content-encoding"];
            if (res.headers["accept-bytes"]) {
                delete res.headers["accept-bytes"];
            }
            res.headers["x-zipped"] = true;
        }

        cache.set(originalReq.url, "headers", res.headers);
        cache.deleteHeader(originalReq.url, "content-length");
    });

    function getRules() {

        var rules = [utils.rewriteLinks(opts, proxyHost)];

        if (additionalRules) {
            if (Array.isArray(additionalRules)) {
                additionalRules.forEach(function (rule) {
                    rules.push(rule);
                });
            } else {
                rules.push(additionalRules);
            }
        }
        return rules;
    }

    return server;
}

module.exports = {
    init: init
};
