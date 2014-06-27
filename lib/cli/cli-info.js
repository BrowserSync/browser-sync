"use strict";

var messages      = require("./../messages");
var config        = require("./../config");
var defaultConfig = require("./../default-config");

var fs            = require("fs");
var path            = require("path");

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
    getDefaultConfigFile: function () {
        return defaultConfig;
    },
    /**
     * Retrieve the config file
     * @returns {*}
     * @private
     * @param filePath
     */
    _getConfigFile: function (filePath) {
        var relPath = path.resolve(process.cwd() + "/" + filePath);
        if (fs.existsSync(relPath)) {
            return require(relPath);
        }
        return false;
    },
    /**
     * Generate an example Config file.
     */
    makeConfig: function () {
        var file = fs.readFileSync(__dirname + config.configFile);
        var path = process.cwd() + config.configFile;
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