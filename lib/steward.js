"use strict";

/**
 * @constructor
 */
var EmitterSteward = function(emitter) {

    this.emitter = null;
    this.counter = 0;
    this.debug = function (msg, vars) {
        emitter.emit("debug", {msg: msg, vars: vars});
    };

    this.setWatcher(2000);
};

module.exports = EmitterSteward;

/**
 * @param timeout
 */
EmitterSteward.prototype.setWatcher = function (timeout) {

    var that = this;

    setInterval(function () {

        that.emitter = null;

    }, timeout);
};

/**
 * @param id
 * @returns {boolean}
 */
EmitterSteward.prototype.valid = function (id) {

    var counter = this.counter += 1;
    var debug   = this.debug;

    if (!this.emitter) {

        this.emitter = id;
        debug("%d:Setting current emitter:", counter);
        return true;

    } else {

        if (id === this.emitter) {

            debug("%d:Same emitter, allowing event", counter);
            return true;

        } else {

            debug("%d:Emitter set, but a different one, refusing", counter);
            return false;

        }
    }
};