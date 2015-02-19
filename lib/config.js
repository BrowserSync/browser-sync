"use strict";

var path = require("path");
/**
 * @type {{controlPanel: {jsFile: string, baseDir: *}, socketIoScript: string, configFile: string, client: {shims: string}}}
 */
module.exports = {
    controlPanel: {
        jsFile: "/js/app.js",
        baseDir: path.resolve(__dirname + "/control-panel")
    },
    templates: {
        scriptTag: path.resolve(__dirname + "/templates/script-tags.tmpl"),
        connector: path.resolve(__dirname + "/templates/connector.tmpl")
    },
    socketIoScript: "/public/socket.io.js",
    configFile: "/default-config.js",
    userFile: "/bs-config.js",
    template: "/cli-template.js",
    client: {
        shims: "/client/client-shims.js"
    },
    errors: {
        "server+proxy": "Invalid config. You cannot specify both server & proxy options.",
        "proxy+https":  "Invalid config. You set https: true, but your proxy target doesn't reflect this."
    }
};
