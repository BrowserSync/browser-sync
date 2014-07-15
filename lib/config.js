var path = require("path");
/**
 * @type {{controlPanel: {jsFile: string, baseDir: *}, socketIoScript: string, configFile: string, client: {shims: string}}}
 */
module.exports = {
    controlPanel: {
        jsFile: "/js/app.js",
        baseDir: path.resolve(__dirname + "/control-panel")
    },
    socketIoScript: "/public/socket.io.js",
    configFile: "/default-config.js",
    userFile: "/bs-config.js",
    template: "/cli-template.js",
    client: {
        shims: "/client/client-shims.js"
    }
};