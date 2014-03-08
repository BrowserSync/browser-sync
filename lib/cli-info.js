"use strict";

var messages = require("./messages");

var fs       = require("fs");

module.exports = {
    /**
     * Version info
     * @param {Object} pjson
     * @returns {String}
     */
    getVersion: function (pjson) {
        console.log(pjson.version);
        return pjson.version;
    },
    /**
     * @returns {Object}
     * @private
     */
    _getDefaultConfigFile: function () {
        var defaultPath = process.cwd() + messages.configFile;
        return this._getConfigFile(defaultPath);
    },
    /**
     * Retrieve the config file
     * @param {String} path
     * @returns {*}
     * @private
     */
    _getConfigFile: function (path) {
        if (fs.existsSync(path)) {
            return require(fs.realpathSync(path));
        }
        return false;
    },
    /**
     * Generate an example Config file.
     */
    makeConfig: function () {
        var file = fs.readFileSync(__dirname + "/config.js");
        var path = process.cwd() + messages.configFile;
        fs.writeFile(path, file, this.confirmConfig(path));
    },
    /**
     * @param {String} path
     * @returns {Function}
     */
    confirmConfig: function (path) {
        return function () {
            console.log(messages.config.confirm(path));
        };
    }
};