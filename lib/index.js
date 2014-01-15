#! /usr/bin/env node
"use strict";

var argv = require("optimist").argv;
var BrowserSync = require("./browser-sync");
var messages = require("./messages");
var fs = require("fs");
var _ = require("lodash");
var pjson = require("../package.json");

var defaultConfig = {
    debugInfo: true,
    background: false,
    defaultConfig: true,
    reloadFileTypes: ["php", "html", "js", "erb"],
    injectFileTypes: ["css", "png", "jpg", "jpeg", "svg", "gif"],
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
    scrollThrottle: 0,
    injectChanges: true
};

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
            return _.extend(defaultConfig, config);
        }

        return this._mergeConfigs(defaultConfig, argv);
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

            var port = /\d{2,4}/.exec(split[1])[0];

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
                return setOptions([matched[1], "80"]);
            }

            // no comma or colon, assume only hostname given
            return setOptions([argv.proxy, "80"]);
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
     * @param {Object} userConfig
     * @returns {Object}
     */
    mergeConfig: function (defaultConfig, userConfig) {
        var merged = _.merge(defaultConfig, userConfig);
        return merged;
    },
    /**
     * Kickoff browser-sync
     * @param files
     * @param config
     */
    kickoff: function (files, config) {
        browserSync.init(files || [], config);
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
        config = setup.mergeConfig(defaultConfig, userConfig || {});
    }
    setup.kickoff(files, config);
};