"use strict";

/**
 * @constructor
 */
var EmitterSteward = function(emitter) {

    this.currentEmitter = null;
    this.counter = 0;

    this.debug = function (msg, vars) {
        emitter.emit("msg:debug", {msg: msg, vars: vars});
    };

    this.setWatcher(1000);
};

module.exports = EmitterSteward;

/**
 * @param timeout
 */
EmitterSteward.prototype.setWatcher = function (timeout) {

    setInterval(resetEmitter.bind(this), timeout);

    function resetEmitter() {
        this.currentEmitter = null;
    }
};

/**
 * @param id
 * @returns {boolean}
 */
EmitterSteward.prototype.valid = function (id) {

    var counter = this.counter += 1;
    var debug   = this.debug;

    if (!this.currentEmitter) {

        this.currentEmitter = id;
        debug("%s:Setting current emitter:", counter);
        return true;

    } else {

        if (id === this.currentEmitter) {

            debug("%s:Same emitter, allowing event", counter);
            return true;

        } else {

            debug("%s:Emitter set, but a different one, refusing", counter);
            return false;

        }
    }
};