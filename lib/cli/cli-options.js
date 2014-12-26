"use strict";


var path = require("path");
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
    proxy: function (value) {

        var protocol = "http";
        var host     = "localhost";
        var port = 80;
        var segs;
        var startPath = false;
        var returnObj;

        var url = value.replace(/^(https?):\/\//, function (match, solo) {
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
            segs = host.split("/");
            host = segs.shift();
            startPath = segs.join("/");
        }


        returnObj = {
            protocol: protocol,
            host: host,
            port: port,
            target: protocol + "://" + host + (port > 80 ? ":" + port : "")
        };


        if (startPath) {
            returnObj.startPath = startPath;
        }

        return Immutable.fromJS(returnObj);
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
    //ports: function (defaultValue, newValue) {
    //
    //    var segs;
    //    var obj = {};
    //
    //    if (typeof newValue === "string") {
    //
    //        if (~newValue.indexOf(",")) {
    //            segs = newValue.split(",");
    //            obj.min = parseInt(segs[0], 10);
    //            obj.max = parseInt(segs[1], 10);
    //        } else {
    //            obj.min = parseInt(newValue, 10);
    //            obj.max = null;
    //        }
    //
    //        return obj;
    //
    //    } else {
    //        return {
    //            min: newValue.min,
    //            max: newValue.max || null
    //        };
    //    }
    //},
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
     * @param defaultValue
     * @param newValue
     * @param args
     * @param config
     * @returns {*}
     */
    //files: function (defaultValue, newValue, args, config) {
    //
    //    var merged = [];
    //    var exclude = config && config.exclude ? config.exclude : false;
    //
    //    if (newValue) {
    //        if (typeof newValue === "string") {
    //            if (~newValue.indexOf(",")) {
    //                merged = merged.concat(newValue.split(",").map(function (item) {
    //                    return item.trim();
    //                }));
    //            } else {
    //                merged.push(newValue);
    //            }
    //        } else {
    //            merged = newValue;
    //        }
    //
    //        if (typeof exclude === "string") {
    //
    //            merged.push(utils.wrapPattern(exclude));
    //
    //        } else {
    //
    //            if (Array.isArray(exclude)) {
    //                exclude.forEach(function (pattern) {
    //                    merged.push(utils.wrapPattern(pattern));
    //                }, this);
    //            }
    //        }
    //    }
    //
    //    return merged;
    //}
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