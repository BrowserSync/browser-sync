"use strict";

var messages = require("./messages");

module.exports.getApi = function (port, options, servers) {

    var snippet = messages.scriptTags(port, options);

    return {
        snippet: snippet,
        options: options,
        servers: servers
    };
};