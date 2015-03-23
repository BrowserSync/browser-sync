"use strict";

module.exports = {
    /**
     * Emit the internal `file:change` event
     * @param {EventEmitter} emitter
     * @param {string} path
     * @param {boolean} [log]
     */
    emitChangeEvent: function emitChangeEvent (emitter, path, log) {
        emitter.emit("file:changed", {
            path:      path,
            log:       log,
            namespace: "core"
        });
    },
    /**
     * Emit the internal `browser:reload` event
     * @param {EventEmitter} emitter
     */
    emitBrowserReload: function emitChangeEvent (emitter) {
        emitter.emit("browser:reload");
    },
    /**
     * Emit the internal `stream:changed` event
     * @param {EventEmitter} emitter
     * @param {Array} changed
     */
    emitStreamChangedEvent: function (emitter, changed) {
        emitter.emit("stream:changed", {changed: changed});
    }
};
