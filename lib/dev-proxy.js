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

    var getSnippet = function (hostIp, socketIoPort, scriptPort) {
        return messages.scriptTags(hostIp, socketIoPort, scriptPort);
    };

    //
    // Set up a proxy
    //
    var server = httpProxy.createServer(function (req, res, proxy) {

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

        // For every request, we wrap the 'write' function of the
        // server, so we can inject the snippet if required.
        var write = res.write;

        res.write = function (string, encoding) {

            var body = string instanceof Buffer ? string.toString() : string;

            // Is it not html
            if (!/<!doctype[^>]*>/i.test(body)) {
                return write.call(res, string, encoding);
            }

            // Try to inject script
            body = body.replace(/<\/body>/, function (w) {
                return messages.scriptTags(host, ports[0], ports[1]) + w;
            });

            if (string instanceof Buffer) {
                string = new Buffer(body);
            } else {
                string = body;
            }

            if (!this.headerSent) {
                this.setHeader('content-length', Buffer.byteLength(body));
                this._implicitHeader();
            }

            write.call(res, string, encoding);
        };

        next();

    }).listen(ports[2]);

    // node-http-proxy exposes the proxy so we can hook event handlers
    // now, instead of on every request, which would be catastrophic
    server.proxy.on('proxyResponse', function (req, res, response) {
        // If the content-length has been specified, remove it. This
        // allows to inject the snippet without truncating issues.

        // NOTE: The drawback of this workaround is that for HTTP/1.0
        // requests, it could cause issues (because RFC says we should
        // send the content-length). In other words, this solution is OK
        // if you only need to provide support for HTTP/1.1, in which
        // case the "transfer-encoding: chunked" header is sent by http
        // proxy server anyway (and AFAIK we cannot prevent that easily)
        // and RFC says we shouldn't send the content-length in these
        // cases.
        if (response.headers.hasOwnProperty("content-length")) {
            delete response.headers["content-length"];
        }
    });


};
