var respMod   = require("resp-modifier");
var httpProxy = require("http-proxy");
var http      = require("http");
var stream    = require('stream');
var zlib      = require('zlib');

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
                unzipRequest(req, res, function() {
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
        if (res.headers['content-type'] === 'text/html' && (res.headers['content-encoding'] === 'gzip' || res.headers['content-encoding'] === 'deflate')) {
            delete res.headers['content-encoding'];
            if (res.headers['accept-bytes']) {
                delete res.headers['accept-bytes'];
            }
            res.headers['x-zipped'] = true;
        }

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

    // This is needed in case server doesn't respect accept-encoding
    // Check if the content-type is text/html (this is the only content-type we inject stuff into)
    // Check that content-encoding is gzip/deflate
    // Prevent data write until content has been unzipped
    function unzipRequest(req, res, next) {
        var _write = res.write;
        var _end = res.end;
        var buffers = [];

        res.write = function (data, encoding) {
            buffers.push(data);
            if (res._headers['content-type'] !== 'text/html') {
                _write.call(res, data, encoding);
            }
        };

        res.end = function (data, encoding) {
            if (data) res.write(data, encoding);
            var buffer = Buffer.concat(buffers);
            if (buffer.length > 0) {
                if (res._headers['content-type'] === 'text/html') {
                    if (res._headers['x-zipped']) {
                        zlib.unzip(buffer, function(err, unzippedBuffer) {
                            if (!err) {
                                _end.call(res, unzippedBuffer, encoding);
                            } else {
                                _end.call(res, buffer, encoding);
                            }
                        });
                    } else {
                        _end.call(res, buffer, encoding);
                    }
                } else {
                  _end.call(res, data, encoding);
                }
            } else {
              _end.call(res, data, encoding);
            }
        };
        next();
    }

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
            _end.call(res, encoding);
        };

        res.writeHead = function () {
            if (cached[req.url]) {
                cached[req.url].code = arguments[0];
            } else {
                cached[req.url] = {
                    code: arguments[0]
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
