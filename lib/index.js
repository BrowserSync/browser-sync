#! /usr/bin/env node
'use strict';

var argv = require('optimist').argv;
var si = require("./browser-sync");
var glob = require("glob");
var fs = require("fs");
var _ = require("lodash");

var defaultConfig = {
    debugInfo: true,
    background: false,
    defaultConfig: true,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
    ghostMode: {
        links: true,
        forms: true,
        scroll: true
    },
    server: false,
    open: true
};

var browserSync = new si();

var setup = {
    /**
     * Take command-line args & config & decide which options to use
     * @param {object} defaultConfig
     * @param {object} argv
     * @returns {object}
     */
    getConfig: function (defaultConfig, argv) {

        var configArg = argv.config;

        if (configArg) {
            if (fs.existsSync(configArg)) {
                return _.extend(defaultConfig, this._getConfigFile(configArg));
            }
        }

        return this._mergeConfigs(defaultConfig, argv);
    },
    _mergeConfigs: function (defaultConfig, argv) {

        // Server config
        defaultConfig = this._setDefaultServerConfig(defaultConfig, argv);

        if (argv.ghostMode === "false") {
            defaultConfig.ghostMode = false;
        }

        return defaultConfig;
    },
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
     * @returns {argv.files|*|.watch.negate.files|exports.files|.echo.files|.watch.files}
     */
    getFilesArg: function (argv, config) {
        return argv.files || config.files || null;
    },
    getFiles: function (files, cb) {

        var isString;
        var returnFiles = [];

        if (typeof files === "string") {

            isString = true;

            if(files.indexOf(",") !== -1) {
                files = files.split(",");
                isString = false;
            }
        }


        if (Array.isArray(files)) { // if an array given
            files.forEach(function (file, i) {
                glob(file, function (er, foundFiles) {

                    returnFiles.push(foundFiles);

                    if (i === files.length - 1) {
                        cb(_.flatten(returnFiles));
                    }
                });
            });
        } else {
            if (isString) {
                glob(files, function (er, foundFiles) {
                    cb(foundFiles);
                });
            } else {
                cb([]);
            }
        }
    },
    kickoff: function (files, config) {
        browserSync.init(files || [], config);
    }
};

if (require.main === module) {

    var config = setup.getConfig(defaultConfig, argv);
    var filesArg = setup.getFilesArg(argv, config);

    setup.getFiles(filesArg, function (files) {
        setup.kickoff(files, config);
    });
}

module.exports.setup = setup;