var path = require('path');
var url = require('url');
var httpProxy = require('http-proxy');
var messages = require('./messages');

/**
 *
 * @param {String} host
 * @param {Array} ports
 * @param {Object} options
 */
module.exports = function (host, ports, options) {

    var proxyOptions = options.proxy || options.website;

    var getSnippet = function () {
        var snp = messages.scriptTags(host, ports[0], ports[1]);
        return snp;
    };

    var excludeList = ['.woff', '.js', '.css', '.ico'];

    function bodyExists(body) {
        if (!body) return false;
        return (~body.lastIndexOf("</body>"));
    }

    function snippetExists(body) {
        if (!body) return true;
        return (~body.lastIndexOf(getSnippet()));
    }

    function acceptsHtmlExplicit(req) {
        var accept = req.headers["accept"];
        if (!accept) return false;
        return (~accept.indexOf("html"));
    }

    function isExcluded(req) {
        var url = req.url;
        var excluded = false;
        if (!url) return true;
        excludeList.forEach(function(exclude) {
            if (~url.indexOf(exclude)) {
                excluded = true;
            }
        });
        return excluded;
    }

    //
    // Set up a proxy
    //
    var server = httpProxy.createServer(function (req, res, proxy) {
        var writeHead = res.writeHead;
        var write = res.write;
        var end = res.end;

        //
        // Put your custom server logic here
        //
        var next = function () {
            proxy.proxyRequest(req, res, {
                host: proxyOptions.host,
                port: proxyOptions.port || 80,
                changeOrigin: true
            });
        };


        if (!acceptsHtmlExplicit(req) || isExcluded(req)) {
            return next();
        }

        res.writeHead = function(statusCode, reasonPhrase, headers) {
            // Prevents sending headers before our patching iif status 200
            if (statusCode !== 200) {
                writeHead.apply(res, arguments);
            }
        };

        res.push = function(chunk) {
            res.data = (res.data || '') + chunk;
        };

        res.inject = res.write = function(string, encoding) {
            res.write = write;
            if (string !== undefined) {
                var body = string instanceof Buffer ? string.toString(encoding) : string;
                if ((bodyExists(body) || bodyExists(res.data)) && !snippetExists(body) && (!res.data || !snippetExists(res.data))) {
                    res.push(body.replace(/<\/body>/, function(w) {
                        return getSnippet() + w;
                    }));
                    return true;
                } else {
                    return res.write(string, encoding);
                }
            }
            return true;
        };

        res.end = function(string, encoding) {
            res.writeHead = writeHead;
            res.end = end;
            var result = res.inject(string, encoding);
            if (!result) return res.end(string, encoding);
            if (res.data !== undefined && !res._header) {
                res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
            }
            res.end(res.data, encoding);
        };

        next();

    }).listen(ports[2]);

};
