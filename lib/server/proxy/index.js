var respMod   = require("resp-modifier");
var httpProxy = require("http-proxy");
var http      = require("http");
var stream    = require('stream');

var utils     = require("./lib/utils");

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
    var cached = {};

    if (!errHandler) {
        errHandler = function (err) {
            console.log(err.message);
        };
    }

    var middleware  = respMod({
        rules: getRules()
    });

    var server = http.createServer(function(req, res) {
        if (cached[req.url] && cached[req.url].body) {
            res.writeHead(cached[req.url].code, cached[req.url].headers);
            res.write(cached[req.url].body);
            res.end();
        } else {
            var next = function () {
                proxyServer.web(req, res, {
                    target: opts.target,
                    headers: {
                        host: hostHeader,
                        "accept-encoding": "identity",
                        agent: false
                    }
                });
            };

            if (additionalMiddleware) {
                cacheRequest(req, res, function() {
                  additionalMiddleware(req, res, function (success) {
                      if (success) {
                          return;
                      }
                      utils.handleIe(req);
                      middleware(req, res, next);
                  });
                });
            } else {
                cacheRequest(req, res, function() {
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
        res.headers['cache-control'] = 'no-cache';

        if (cached[originalReq.url]) {
            cached[originalReq.url].headers = res.headers;
            delete cached[originalReq.url].headers['content-length'];
        } else {
            cached[originalReq.url] = {
                headers: res.headers
            };
            delete cached[originalReq.url].headers['content-length'];
        }
    });

    function cacheRequest(req, res, next) {
        var _write = res.write;
        var _end = res.end;
        var _writeHead = res.writeHead;
        var buffers = [];

        res.write = function (data, encoding) {
            buffers.push(data);
            _write.call(res, data, encoding);
        };

        res.end = function (data, encoding) {
            if (data) res.write(data, encoding);
            var buffer = Buffer.concat(buffers);
            if (buffer.length > 0) {
                cached[req.url].body = buffer;
            }
            _end.call(res, data, encoding);
        };

        res.writeHead = function (code, headers) {
            if (cached[req.url]) {
                cached[req.url].code = code;
                if (!cached[req.url].headers) {
                    cached[req.url].headers = headers;
                }
            } else {
                cached[req.url] = {
                    code: code,
                    headers: headers
                };
            }
            _writeHead.apply(res, arguments);
        };
        next();
    }

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