"use strict";

var path = require("path");
var url = require("url");
var _    = require("lodash");
var Immutable = require("immutable");
var isList = Immutable.List.isList;
var defaultConfig = require("../default-config");
var immDefs = Immutable.fromJS(defaultConfig);

var opts = exports;

/**
 * @type {{wrapPattern: Function}}
 */
opts.utils = {

    /**
     * Transform a string arg such as "*.html, css/*.css" into array
     * @param string
     * @returns {Array}
     */
    explodeFilesArg: function (string) {
        return string.split(",").map(function (item) {
            return item.trim();
        });
    },
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
    addExcluded: function (exclude) {
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
     * @param [argv]
     * @returns {*}
     */
    server: function (value, argv) {

        if (value === false) {
            if (!argv || !argv.server) {
                return false;
            }
        }

        var obj = {
            baseDir: "./"
        };

        if (_.isString(value) || isList(value)) {
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
     * @param value
     * @param argv
     * @returns {*}
     */
    proxy: function (value, argv) {

        if (!value || value === true) {
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
                    argv.startPath.charAt(0) === "/" ? argv.startPath : "/" + argv.startPath
                );
            }
        });
    },
    /**
     * @param value
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
     * Allow tunnel arg to be `true`, or an object.
     * https://www.npmjs.com/package/ngrok
     * @param {Boolean|Object} value
     * @returns {Map}
     */
    tunnel: function (value) {
        if (!value) {
            return false;
        }
        var opts = Immutable.Map({});
        if (value === true) {
            return opts;
        }
        return opts.merge(value);
    },
    /**
     * @param value
     * @param argv
     * @returns {*}
     */
    ghostMode: function (value, argv) {

        if (_.isUndefined(value)) {
            return;
        }

        var trueAll = {
            clicks: true,
            scroll: true,
            forms: {
                submit: true,
                inputs: true,
                toggles: true
            }
        };

        var falseAll = {
            clicks: false,
            scroll: false,
            forms: {
                submit: false,
                inputs: false,
                toggles: false
            }
        };

        if (value === false || value === "false" || argv && argv.ghost === false) {
            return Immutable.fromJS(falseAll);
        }

        if (value === true || value === "true" || argv && argv.ghost === true) {
            return Immutable.fromJS(trueAll);
        }

        if (value.get("forms") === false) {
            return value.withMutations(function (map) {
                map.set("forms", Immutable.fromJS({
                    submit: false,
                    inputs: false,
                    toggles: false
                }));
            });
        }

        if (value.get("forms") === true) {
            return value.withMutations(function (map) {
                map.set("forms", Immutable.fromJS({
                    submit: true,
                    inputs: true,
                    toggles: true
                }));
            });
        }

        return value;
    },
    /**
     * @param value
     * @param argv
     * @returns {*}
     */
    files: function (value, argv) {

        var merged = [];

        if (_.isString(value)) {
            merged = merged.concat(opts.utils.explodeFilesArg(value));
        }

        if (argv && argv.files) {
            if (~argv.files.indexOf(",")) {
                merged = merged.concat(opts.utils.explodeFilesArg(argv.files));
            } else {
                merged.push(argv.files);
            }

            if (argv.exclude) {
                merged = merged.concat(opts.utils.addExcluded(argv.exclude));
            }

            return Immutable.List(merged);

        } else {
            if (value === false) {
                return false;
            }
        }

        if (merged.length) {
            return Immutable.List(merged); // default case is array
        }

        if (isList(value)) {
            return value;
        }

        return Immutable.fromJS(value).map(function (value) {
            if (_.isString(value)) {
                return Immutable.List([value]);
            }
        });
    }
};

/**
 * @param {Object} values
 * @param {Object} [argv]
 * @returns {Map}
 */
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
