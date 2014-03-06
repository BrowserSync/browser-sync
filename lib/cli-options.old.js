var _ = require("lodash");
var path = require("path");
var fs = require("fs");
var messages = require("./messages");
var BrowserSync = require("./browser-sync");

var utils = {
    /**
     * Take command-line args & config & decide which options to use
     * @param {object} defaultConfig
     * @param {object} argv
     * @returns {object}
     */
    getConfig: function (defaultConfig, argv) {

        var configArg = argv.config;
        var defaultConfigFile = this._getDefaultConfigFile();
        var config;

        if (configArg) {
            config = this._getConfigFile(configArg);
        } else {
            config = defaultConfigFile;
        }

        if (config) {
            return this.mergeConfigObjects(defaultConfig, config);
        }

        return this._mergeConfigs(defaultConfig, argv);
    },
    /**
     * Merge user-given file extensions with defaults
     * @param {Object} defaultConfig
     * @param {Object} config
     * @returns {Object}
     * @private
     */
    _mergeExcluded: function (defaultConfig, config) {

        var excluded = config.excludedFileTypes;

        if (excluded && Array.isArray(excluded)) {
            config.excludedFileTypes = _.union(defaultConfig.excludedFileTypes, excluded);
        }

        return config;
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
     * Get the files arg - first from the command line, second from
     * custom config - or null
     * @param {object} argv
     * @param {object} config
     * @returns {argv.files}
     */
    getFilesArg: function (argv, config) {
        return argv.files || config.files || null;
    },
    /**
     * Resolve the file patterns
     * @param filesArg
     * @returns {*}
     */
    getFiles: function (filesArg) {

        if (typeof filesArg === "string") {

            if (filesArg.indexOf(",") !== -1) {
                return filesArg.split(",");
            } else {
                return (filesArg.length > 0) ? filesArg : false;
            }
        }

        if (Array.isArray(filesArg)) {
            return filesArg;
        }

        return false;
    },
    /**
     * Accept a user-provided config object and merge with default
     * @param {Object} defaultConfig
     * @param {Object} userConfig
     * @returns {Object}
     */
    mergeConfigObjects: function (defaultConfig, userConfig) {
        if (userConfig && userConfig.excludedFileTypes) {
            userConfig = this._mergeExcluded(defaultConfig, userConfig);
        }
        var merged = _.merge(defaultConfig, userConfig);
        return merged;
    },
    /**
     * @param {String|Array} files
     * @param {String|Array} exclude
     * @returns {Array}
     */
    mergeFiles: function (files, exclude) {

        var merged;
        var wrapPattern = this._wrapPattern;

        if (typeof files === "string") {
            merged = [];
            merged.push(files);
        } else {
            merged = files;
        }

        if (typeof exclude === "string") {
            merged.push(wrapPattern(exclude));
        } else {
            if (Array.isArray(exclude)) {
                exclude.forEach(function (pattern) {
                    merged.push(wrapPattern(pattern));
                });
            }
        }

        return merged;
    },
    /**
     * @param {String} pattern
     * @returns {string}
     */
    _wrapPattern: function (pattern) {

        var prefix = "!";
        var suffix = "/**";
        var lastChar = pattern.charAt(pattern.length - 1);
        var extName = path.extname(pattern);

        // If there's a file ext, don't append any suffix
        if (extName.length) {
            suffix = "";
        } else {

            if (lastChar === "/") {
                suffix = "**";
            }

            if (lastChar === "*") {
                suffix = "";
            }
        }

        return [prefix, pattern, suffix].join("");
    },
    /**
     * @param {Array|String} files
     * @param {Object} config
     * @param {String} version
     * @private
     */
    _start: function (files, config, version) {
        var browserSync = new BrowserSync();
        return browserSync.init(files || [], config, version);
    }
};
module.exports.utils = utils;