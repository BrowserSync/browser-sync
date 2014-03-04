"use strict";

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
    _mergeProxyOption: function (defaultValue, arg, argv) {
        return {
            host: "localhost",
            port: "8000"
        }
    }
};