"use strict";

var messages      = require("./../messages");
var config        = require("./../config");
var defaultConfig = require("./../default-config");

var fs            = require("fs");
var _             = require("lodash");
var path          = require("path");

var info = {
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

        var opts = require(__dirname + "/../" + config.configFile);
        var userOpts = {};

        var ignore = ["excludedFileTypes", "injectFileTypes"];

        Object.keys(opts).forEach(function (key) {
            if (!_.contains(ignore, key)) {
                userOpts[key] = opts[key];
            }
        });

        var file = fs.readFileSync(__dirname + config.template);

        file = file.toString().replace("//OPTS", JSON.stringify(userOpts, null, 4));

        var path = process.cwd() + config.userFile;

        info.createFile(path, file);
    },
    /**
     * @param path
     * @param content
     * @param cb
     */
    createFile: function (path, content) {
        fs.writeFile(path, content, info.confirmConfig(path));
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

module.exports = info;