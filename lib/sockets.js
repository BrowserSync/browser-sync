"use strict";

var socket = require("socket.io");

/**
 * @type {{setupSocket: setupSocket}}
 */
module.exports = {
    /**
     * @param {Number} port
     * @param {Array} events
     * @param {Object} options
     * @param {EventEmitter} emitter
     * @returns {*|http.Server}
     */
    init: function (port, events, options, emitter) {

        var io = socket.listen(port, {log: false});

        io.set("log level", 0);

        this.socketConnection(events, options, io, emitter);

        return io;
    },
    /**
     * @param {Array} events
     * @param {Object} options
     * @param {Socket} io
     * @param {EventEmitter} emitter
     */
    socketConnection: function (events, options, io, emitter) {

        var _this = this;
        var ua;

        io.sockets.on("connection", function (client) {

            // set ghostmode callbacks
            if (options.ghostMode) {
                events.forEach(function (evt) {
                    _this.clientEvent(client, evt);
                });
            }

            client.emit("connection", options);

            ua = client.handshake.headers["user-agent"];

            emitter.emit("client:connected", {ua: ua});
        });
    },
    /**
     * @param client
     * @param event
     */
    clientEvent: function (client, event) {
        client.on(event, function (data) {
            client.broadcast.emit(event, data);
        });
    },
    /**
     * Plugin interface
     * @returns {*|function(this:exports)}
     */
    plugin: function () {
        return function (port, events, options, emitter) {
            return this.init(port, events, options, emitter);
        }.bind(this);
    }
};