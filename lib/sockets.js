"use strict";

var socket  = require("socket.io");
var Steward = require("./steward");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function () {
    return function (port, events, options, emitter) {
        return exports.init(port, events, options, emitter);
    };
};


/**
 * @param {http.Server} server
 * @param {Array} events
 * @param {Object} options
 * @param {EventEmitter} emitter
 * @returns {http.Server}
 */
module.exports.init = function (server, events, options, emitter) {

    var io = socket.listen(server, {log: false});

    var steward = new Steward(emitter);

    io.sockets.on("connection", function (client) {

        // set ghostmode callbacks
        if (options.ghostMode) {

            events.forEach(function (event) {

                client.on(event, function (data) {

                    if (steward.valid(client.id)) {

                        client.broadcast.emit(event, data);

                    }
                });
            });
        }

        client.emit("connection", options);

        emitter.emit("client:connected", {
            ua: client.handshake.headers["user-agent"]
        });
    });


    return io;
};