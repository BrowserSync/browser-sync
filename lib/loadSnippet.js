var path = require('path');
var url = require('url');
var messages = require('./messages');
var write = require('./snippet').write;
var utils = require('./snippet').utils;

module.exports = function (hostIp, socketIoPort, scriptPort, controlPanel) {

    return function (req, res, next) {

        if (utils.isExcluded(req)) {
            return next();
        }

        var tags = (controlPanel)
                ? messages.snippets.controlPanel(hostIp, socketIoPort, scriptPort)
                : messages.snippets.client(hostIp, socketIoPort, scriptPort);

        res.write = write(res, tags, true);

        next();
    };
};