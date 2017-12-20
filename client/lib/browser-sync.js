"use strict";

var socket       = require("./socket");
var emitter      = require("./emitter");
var notify       = require("./notify");
var tab          = require("./tab");
var utils        = require("./browser.utils");

/**
 * @constructor
 */
var BrowserSync = function (options) {

    this.options   = options;
    this.socket    = socket;
    this.emitter   = emitter;
    this.utils     = utils;
    this.tabHidden = false;

    var bs = this;

    /**
     * Options set
     */
    socket.on("options:set", function (data) {
        emitter.emit("notify", "Setting options...");
        bs.options = data.options;
    });

    emitter.on("tab:hidden", function () {
        bs.tabHidden = true;
    });
    emitter.on("tab:visible", function () {
        bs.tabHidden = false;
    });
};

/**
 * Helper to check if syncing is allowed
 * @param data
 * @param optPath
 * @returns {boolean}
 */
BrowserSync.prototype.canSync = function (data, optPath) {

    data = data || {};

    if (data.override) {
        return true;
    }

    var canSync = true;

    if (optPath) {
        canSync = this.getOption(optPath);
    }

    return canSync && data.url === window.location.pathname;
};

/**
 * Helper to check if syncing is allowed
 * @returns {boolean}
 */
BrowserSync.prototype.getOption = function (path) {

    if (path && path.match(/\./)) {

        return getByPath(this.options, path);

    } else {

        var opt = this.options[path];

        if (isUndefined(opt)) {
            return false;
        } else {
            return opt;
        }
    }
};

/**
 * @type {Function}
 */
module.exports = BrowserSync;

/**
 * @param {String} val
 * @returns {boolean}
 */
function isUndefined(val) {

    return "undefined" === typeof val;
}

/**
 * @param obj
 * @param path
 */
function getByPath(obj, path) {

    for(var i = 0, tempPath = path.split("."), len = tempPath.length; i < len; i++){
        if(!obj || typeof obj !== "object") {
            return false;
        }
        obj = obj[tempPath[i]];
    }

    if(typeof obj === "undefined") {
        return false;
    }

    return obj;
}