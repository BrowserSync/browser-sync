"use strict";

module.exports = {
    /**
     * Merge Server Options
     * @param {Object} defaultValue
     * @param {String} arg
     * @param {Object} [argv] - process.argv
     * @returns {{baseDir: string}}
     * @private
     */
    _mergeServerOption: function (defaultValue, arg, argv) {

        // Return if object given
        if (arg.baseDir) {
            return arg;
        }

        var obj = {
            baseDir: "./"
        };

        if (arg !== true) {
            obj.baseDir = arg;
        }

        if (argv && argv.index) {
            obj.index = argv.index;
        }

        return obj;
    },
    /**
     * @param {Object} defaultValue
     * @param {String} arg
     * @param {Object} [argv] - process.argv
     * @private
     */
    _mergeProxyOption: function (defaultValue, arg) {

        var protocol = "http";
        var host = "localhost";
        var port = 80;
        var segs;

        var url = arg.replace(/^(https?):\/\//, function (match, solo) {
            protocol = solo;
            return "";
        });

        if (~url.indexOf(":")) {
            segs = url.split(":");
            host = segs[0];
            port = parseInt(segs[1], 10);
        } else {
            host = url;
        }

        if (~host.indexOf("/")) {
            host = /^(.+?)\//.exec(host)[1];
        }

        return {
            protocol: protocol,
            host: host,
            port: port
        };
    },
    /**
     * @param {Object} defaultValue
     * @param {String} arg
     * @param {Object} [argv] - process.argv
     * @returns {String}
     * @private
     */
    _mergeHostOption: function (defaultValue, arg) {
        if (arg && typeof arg === "string") {
            return arg;
        }
        return null;
    },
    /**
     * @param defaultValue
     * @param arg
     * @param [argv]
     * @private
     */
    _mergePortsOption: function (defaultValue, arg) {

        var segs;
        var obj = {};

        if (typeof arg === "string") {

            if (~arg.indexOf(",")) {
                segs = arg.split(",");
                obj.min = parseInt(segs[0], 10);
                obj.max = parseInt(segs[1], 10);
            } else {
                obj.min = parseInt(arg, 10);
                obj.max = null;
            }

            return obj;

        } else {
            return {
                min: arg.min,
                max: arg.max || null
            };
        }
    },
    /**
     * @private
     */
    _mergeGhostModeOption: function (defaultValue, arg) {
        if (!arg || arg === "false") {
            return false;
        }
        return arg;
    }
};