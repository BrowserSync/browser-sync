#! /usr/bin/env node
'use strict';

var argv = require('optimist').argv;
var si = require("./style-injector");
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
    server: {
        baseDir: "./"
    },
    open: true
};

var styleInjector = new si();

var setup = {
    /**
     * Take command-line args & config & decide which options to use
     * @param {object} defaultConfig
     * @param {object} argv
     * @returns {object}
     */
    getConfig: function (defaultConfig, argv) {

        var config;
        var configArg = argv.config;

        if (configArg) {
            if (fs.existsSync(configArg)) {
                return this._getConfigFile(configArg);
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

        var returnFiles = [];
        var hasFinished = true;

        if (Array.isArray(files)) {
            files.forEach(function (file, i) {
                glob(file, function (er, foundFiles) {

                    returnFiles.push(foundFiles);

                    if (i === files.length - 1) {
                        cb(_.flatten(returnFiles));
                    }
                });
            });
        }
        if (typeof files === "string") {
            glob(files, function (er, foundFiles) {
                cb(foundFiles);
            });
        } else {
            cb();
        }
    },
    kickoff: function (files, config) {
        styleInjector.init(files || [], config);
    }
};

//
if (require.main === module) {
    var config = setup.getConfig(defaultConfig, argv);
    var files = setup.getFiles(setup.getFilesArg(argv, config), function (files) {
        setup.kickoff(files, config);
    });
}

module.exports.setup = setup;