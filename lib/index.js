#! /usr/bin/env node
"use strict";

var argv = require("optimist").argv;
var BrowserSync = require("./browser-sync");
var messages = require("./messages");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var pjson = require("../package.json");

var defaultConfig = {
    debugInfo: true,
    injectFileTypes: ["css", "png", "jpg", "jpeg", "svg", "gif", "webp"],
    host: null,
    ghostMode: {
        clickedLinks: false,
        clicks: true,
        links: true,
        forms: true,
        scroll: true
    },
    server: false,
    proxy: false,
    open: true,
    notify: true,
    devMode: false,
    fileTimeout: 1000,
    scrollProportionally: true,
    scrollThrottle: 0,
    reloadDelay: 0,
    injectChanges: true,
    startPath: null,
    excludedFileTypes: [
        "js",
        "css",
        "map",
        "svg",
        "ico",
        "woff",
        "json",
        "eot",
        "ttf",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "gif",
        "mp4",
        "mp3",
        "3gp",
        "ogg",
        "ogv",
        "webm",
        "m4a",
        "flv",
        "wmv",
        "avi",
        "swf"
    ]
};
module.exports.defaultConfig = defaultConfig;

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

var browserSync = new BrowserSync();

var setup = {
    /**
     * Take command-line args & config & decide which options to use
     * @param {object} defaultConfig
     * @param {object} argv
     * @returns {object}
     */
    getConfig: function (defaultConfig, argv) {

        var configArg   = argv.config;
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
     * @param defaultConfig
     * @param argv
     * @returns {*}
     * @private
     */
    _mergeConfigs: function (defaultConfig, argv) {

        // Host Config
        defaultConfig = this._setHostConfig(defaultConfig, argv);

        // Server config
        defaultConfig = this._setDefaultServerConfig(defaultConfig, argv);

        // Proxy Config
        defaultConfig = this._setProxyConfig(defaultConfig, argv);

        // Ports Config
        defaultConfig = this._setPortsConfig(defaultConfig, argv);

        if (argv.ghostMode === "false") {
            defaultConfig.ghostMode = false;
        }

        if (argv.devMode) {
            defaultConfig.devMode = true;
        }

        return defaultConfig;
    },
    /**
     *
     * @param {Object} defaultConfig
     * @param {Object} argv
     * @returns {Object}
     * @private
     */
    _setHostConfig: function (defaultConfig, argv) {

        if (argv.host && typeof argv.host === "string") {
            defaultConfig.host = argv.host;
        }
        return defaultConfig;
    },
    /**
     * @param defaultConfig
     * @param argv
     * @returns {*}
     * @private
     */
    _setDefaultServerConfig: function (defaultConfig, argv) {

        if (argv.server) {
            if (argv.server !== true) {
                defaultConfig.server = {
                    baseDir: argv.server,
                    index: argv.index || "index.html"
                };
            } else {
                defaultConfig.server = {
                    baseDir: "./",
                    index: argv.index || "index.html"
                };
            }
        }

        return defaultConfig;
    },
    /**
     * Normalize urls/hosts/ports to allow virtually anything to be copy/pasted into command-line
     * @param {Object} defaultConfig
     * @param {Object} argv
     * @returns {Object}
     * @private
     */
    _setProxyConfig: function (defaultConfig, argv) {

        var setOptions = function (split) {

            var port = null;

            if (split.length === 2) {
                port = /\d{2,4}/.exec(split[1])[0];
            }

            defaultConfig.proxy = {
                host: split[0],
                port: port
            };

            return defaultConfig;
        };

        if (typeof argv.proxy === "string") {

            argv.proxy =  argv.proxy.replace(/https?:\/\//, "");
            argv.proxy =  argv.proxy.replace(/^www\./, "");

            if (argv.proxy.indexOf(":") !== -1 ) {
                return setOptions(argv.proxy.split(":"));
            }
            if (argv.proxy.indexOf(",") !== -1 ) {
                return setOptions(argv.proxy.split(","));
            }

            // Only host name here
            var matched = /^(.+?)\//.exec(argv.proxy);

            if (matched) {
                return setOptions([matched[1]]);
            }

            // no comma or colon, assume only hostname given
            return setOptions([argv.proxy]);
        }

        if (argv.proxy) {
            defaultConfig.proxy = argv.proxy;
            return defaultConfig;
        }

        return defaultConfig;
    },
    /**
     *
     * @param {Object} defaultConfig
     * @param {Object} argv
     * @returns {Object}
     * @private
     */
    _setPortsConfig: function (defaultConfig, argv) {

        if (argv.ports) {

            if (typeof argv.ports === "number") {
                defaultConfig.ports = {
                    min: argv.ports
                };
            } else {

                var split = argv.ports.replace(" ", "").split(",");

                defaultConfig.ports = {
                    min: parseInt(split[0], 10),
                    max: (split[1]) ? parseInt(split[1], 10) : null
                };
            }
        }
        return defaultConfig;
    },
    /**
     * Retrieve the config file
     * @param path
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
     * custom config, third from default
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

            if(filesArg.indexOf(",") !== -1) {
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
        var lastChar = pattern.charAt(pattern.length-1);
        var extName  = path.extname(pattern);

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
     * Kickoff browser-sync
     * @param files
     * @param config
     */
    kickoff: function (files, config) {
        return browserSync.init(files || [], config, pjson.version);
    }
};

/**
 * Are we running from the command-line?
 */
if (require.main === module) {

    if (argv.version || argv.v) {
        return info.getVersion(pjson);
    }

    if (argv._[0] === "init") {
        return info.makeConfig();
    }

    var config   = setup.getConfig(defaultConfig, argv),
        filesArg = setup.getFilesArg(argv, config),
        files    = setup.getFiles(filesArg);

    if (config.exclude) {
        files = setup.mergeFiles(files, config.exclude);
    }

    setup.kickoff(files, config);
}

module.exports.setup = setup;
module.exports.info = info;
module.exports.defaultConfig = defaultConfig;

/**
 * @param {String|Array} [files]
 * @param {Object} [userConfig]
 */
module.exports.init = function (files, userConfig) {
    var config = defaultConfig;
    if (userConfig) {

        config = setup.mergeConfigObjects(defaultConfig, userConfig || {});

        if (files && userConfig.exclude) {
            files = setup.mergeFiles(files, userConfig.exclude);
        }
    }
    return setup.kickoff(files, config);
};
