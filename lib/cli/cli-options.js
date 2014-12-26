"use strict";


var path = require("path");
var url = require("url");
var _    = require("lodash");
var Immutable = require("immutable");
var defaultConfig = require("../default-config");
var immDefs = Immutable.fromJS(defaultConfig);

var opts = exports;

/**
 * @type {{wrapPattern: Function}}
 */
opts.utils = {
    /**
     * @param pattern
     * @returns {*|string}
     * @private
     */
    wrapPattern: function (pattern) {
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
    addExcluded: function(exclude) {
        var arr = [];
        if (_.isString(exclude)) {
            arr.push(opts.utils.wrapPattern(exclude));
        } else {
            if (Array.isArray(exclude)) {
                exclude.forEach(function (pattern) {
                    arr.push(opts.utils.wrapPattern(pattern));
                }, this);
            }
        }
        return arr;
    }
};

opts.callbacks = {

    /**
     * Merge server options
     * @param {String|Boolean|Object} value
     * @returns {*}
     */
    server: function (value, argv) {

        var obj = {
            baseDir: "./"
        };

        if (_.isString(value)) {
            obj.baseDir = value;
        } else {
            if (value && value !== true) {
                if (value.get("baseDir")) {
                    return value;
                }
            }
        }

        if (argv) {

            if (argv.index) {
                obj.index = argv.index;
            }

            if (argv.directory) {
                obj.directory = true;
            }
        }

        return Immutable.fromJS(obj);
    },
    /**
     * @param defaultValue
     * @param newValue
     * @returns {*}
     */
    proxy: function (value, argv) {

        if (!value) {
            return false;
        }

        if (!value.match(/^(https?):\/\//)) {
            value = "http://" + value;
        }

        var parsedUrl = url.parse(value);

        return Immutable.Map(parsedUrl).withMutations(function (map) {
            map.set("target", parsedUrl.protocol + "//" + parsedUrl.host);

            if (!parsedUrl.port) {
                map.set("port", 80);
            }

            if (argv && argv.startPath && parsedUrl.path === "/") {
                map.set("path",
                    argv.startPath.charAt(0) === "/"
                        ? argv.startPath
                        : "/" + argv.startPath
                );
            }
        });
    },
    /**
     * @param {Object} defaultValue
     * @param {String} newValue
     * @returns {String}
     * @private
     */
    //host: function (defaultValue, newValue) {
    //    if (newValue && typeof newValue === "string") {
    //        return newValue;
    //    }
    //    return null;
    //},
    /**
     * @param defaultValue
     * @param newValue
     * @private
     */
    ports: function (value) {

        var segs;
        var obj = {};

        if (typeof value === "string") {

            if (~value.indexOf(",")) {
                segs = value.split(",");
                obj.min = parseInt(segs[0], 10);
                obj.max = parseInt(segs[1], 10);
            } else {
                obj.min = parseInt(value, 10);
                obj.max = null;
            }

        } else {

            obj.min = value.get("min");
            obj.max = value.get("max") || null;
        }

        return Immutable.Map(obj);
    },
    /**
     * @param defaultValue
     * @returns {*}
     */
    //ghostMode: function (defaultValue, merged, newValue, args) {
    //
    //    var def = _.cloneDeep(merged);
    //
    //    var trueAll = {
    //        clicks: true,
    //        scroll: true,
    //        location: false,
    //        forms: {
    //            submit: true,
    //            inputs: true,
    //            toggles: true
    //        }
    //    };
    //    var falseAll = {
    //        clicks: false,
    //        scroll: false,
    //        location: false,
    //        forms: {
    //            submit: false,
    //            inputs: false,
    //            toggles: false
    //        }
    //    };
    //
    //    if (merged === false || merged === "false" || args && args.ghost === false) {
    //        return falseAll;
    //    }
    //
    //    if (merged === true || merged === "true" || args && args.ghost === true) {
    //        return trueAll;
    //    }
    //
    //    if (merged.forms === false || newValue === false || newValue === "false") {
    //        def.forms = {
    //            submit: false,
    //            inputs: false,
    //            toggles: false
    //        };
    //    }
    //    if (merged.forms === true || newValue === true || newValue === "true") {
    //        def.forms = {
    //            submit: true,
    //            inputs: true,
    //            toggles: true
    //        };
    //    }
    //
    //    return def;
    //},
    /**
     * @returns {*}
     * @param value
     * @param argv
     */
    files: function (value, argv) {

        var merged = [];

        if (_.isString(value)) {
            merged.push(value);
        }

        if (argv && argv.files) {
            if (~argv.files.indexOf(",")) {
                merged = merged.concat(argv.files.split(",").map(function (item) {
                    return item.trim();
                }));
            } else {
                merged.push(argv.files);
            }

            if (argv.exclude) {
                merged = merged.concat(opts.utils.addExcluded(argv.exclude));
            }
            return Immutable.fromJS(merged);
        }

        return value; // default case is array
    }
};

opts.merge = function (values, argv) {
    return immDefs
        .mergeDeep(values)
        .withMutations(function (item) {
            item.map(function (value, key) {
                if (opts.callbacks[key]) {
                    item.set(key, opts.callbacks[key](value, argv));
                }
            });
        });
};