"use strict";

var config        = require("../config");
var utils         = require("../utils");
var logger        = require("../logger").logger;

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
     * Retrieve the config file
     * @returns {*}
     * @private
     * @param filePath
     */
    getConfigFile: function (filePath) {
        return require(path.resolve(filePath));
    },
    /**
     * Generate an example Config file.
     */
    makeConfig: function (cwd, cb) {

        var opts = require(path.join(__dirname, "..", config.configFile));
        var userOpts = {};

        var ignore = ["excludedFileTypes", "injectFileTypes", "snippetOptions"];

        Object.keys(opts).forEach(function (key) {
            if (!_.contains(ignore, key)) {
                userOpts[key] = opts[key];
            }
        });

        var file = fs.readFileSync(path.join(__dirname, config.template), "utf8");

        file = file.replace("//OPTS", JSON.stringify(userOpts, null, 4));

        var filePath = cwd + config.userFile;

        fs.writeFile(filePath, file, function () {
            logger.info("Config file created {magenta:%s}", utils.resolveRelativeFilePath(filePath, cwd));
            logger.info(
              "To use it, in the same directory run: " +
              "{cyan:browser-sync start --config bs-config.js}"
            );
            cb();
        });
    }
};

module.exports = info;
