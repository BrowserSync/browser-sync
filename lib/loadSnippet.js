var path = require('path');
var url = require('url');
var messages = require('./messages');
var ports = {};

var getSnippet = function (hostIp, socketIoPort, scriptPort) {
    return messages.scriptTags(hostIp, socketIoPort, scriptPort, false);
};

module.exports.setVars = function (hostIp, socketIoPort, scriptPort) {
    ports.hostIp = hostIp;
    ports.socketIoPort = socketIoPort;
    ports.scriptPort = scriptPort;
};

module.exports.middleWare = function (req, res, next) {

    var write = res.write;

    var filepath = url.parse(req.url).pathname;
    filepath = filepath.slice(-1) === '/' ? filepath + 'index.html' : filepath;

    // Exit if the path is not for an html file.
    if (path.extname(filepath) !== '.html') {
        return next();
    }

    res.write = function (string, encoding) {
        var body = string instanceof Buffer ? string.toString() : string;

        body = body.replace(/<\/body>/, function (w) {
            return getSnippet(ports.hostIp, ports.socketIoPort, ports.scriptPort) + w;
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
};