var clc = require("cli-color");
var _ = require("lodash");

/**
 * @param template
 * @param params
 * @returns {*}
 */
var evalString = function (template, params) {

    var compiled = _compile(template, params);

    if (compiled.indexOf("clc.") !== -1) {
        return eval(compiled);
    } else {
        return compiled;
    }
};

/**
 * @returns {*}
 * @private
 */
var _compile = function (string, params) {
    var template = _.template(string)(params);
    var colors = _compileColors(template);
    return colors;
};

/**
 * @returns {*}
 * @param string
 * @private
 */
var _compileColors = function (string) {

    /**
     * Add JS code
     * @param string
     * @returns {XML|string|void}
     */
    var modifier = function (string) {

        var split = /{(.+?[^:]):(.+?)(?:})/.exec(string);

        var color = split[1];
        var content = split[2];

        return clc[color](content);
    };

    /**
     * @param string
     * @returns {}
     */
    var replacer = function (string) {
        return modifier(string);
    };

    return string.replace(/({.+?[^:]:)(.+?)(?:})/g, replacer);
};


module.exports.evalString = evalString;
module.exports._compile = _compile;
module.exports._compileColors = _compileColors;

