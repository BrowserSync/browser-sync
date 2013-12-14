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

        var write = res.write;

        res.write = function (string, encoding) {

            var body = string instanceof Buffer ? string.toString() : string;

            // Try to inject script
            body = body.replace(/<\/body>/, function (w) {
                return messages.scriptTags(host, ports[0], ports[1]) + w;
            });

            if (string instanceof Buffer) {
                string = new Buffer(body);
            } else {
                string = body;
            }

            // Remove content-length to allow snippets to inserted to any body length
            write.call(res, string, encoding);
        };

        next();

    }).listen(ports[2]);

    server.proxy.on("proxyResponse", function (req, res, response) {
        if (response.headers.hasOwnProperty("content-length")) {
            delete response.headers['content-length'];
        }
    });

    return server;

};