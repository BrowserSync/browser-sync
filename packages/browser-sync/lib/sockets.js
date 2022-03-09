"use strict";

var socket = require("socket.io");
var utils = require("./server/utils");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function(server, clientEvents, bs) {
    return exports.init(server, clientEvents, bs);
};

/**
 * @param {http.Server} server
 * @param clientEvents
 * @param {BrowserSync} bs
 */
module.exports.init = function(server, clientEvents, bs) {
    var emitter = bs.events;

    var socketConfig = bs.options.get("socket").toJS();

    if (
        bs.options.get("mode") === "proxy" &&
        bs.options.getIn(["proxy", "ws"])
    ) {
        server = utils.getServer(null, bs.options).server;
        server.listen(bs.options.getIn(["socket", "port"]));
        bs.registerCleanupTask(function() {
            server.close();
        });
    }

    var socketIoConfig = socketConfig.socketIoOptions;
    socketIoConfig.path = socketConfig.path;
    // set pingTimeout from clients.heartbeatTimeout after heartbeat reversal in engine.io@4
    // https://socket.io/blog/engine-io-4-release/#Heartbeat-mechanism-reversal
    socketIoConfig.pingTimeout = socketConfig.clients.heartbeatTimeout;
    // enable cors for any domain after socket.io@3
    // https://socket.io/docs/v3/migrating-from-2-x-to-3-0/#cors-handling
    socketIoConfig.cors = {
        origins: (origin, callback) => callback(null, origin)
    }

    // create instance of socket.io Server
    var io = socket(server, socketIoConfig);
    // move internal sockets property back to connected to maintain backwards compatibility after socket.io@3
    // https://socket.io/docs/v3/migrating-from-2-x-to-3-0/#namespaceconnected-is-renamed-to-namespacesockets-and-is-now-a-map

    io.connected = io.sockets
    io.sockets = io.of(socketConfig.namespace)

    /**
     * Listen for new connections
     */
    io.sockets.on("connection", handleConnection);

    /**
     * Handle each new connection
     * @param {Object} client
     */
    function handleConnection(client) {
        // set ghostmode callbacks
        if (bs.options.get("ghostMode")) {
            addGhostMode(client);
        }

        client.emit("connection", bs.options.toJS()); //todo - trim the amount of options sent to clients

        emitter.emit("client:connected", {
            ua: client.handshake.headers["user-agent"],
            ip: client.handshake.address
        });
        
        client.on("disconnect", function() {
            emitter.emit("client:disconnected", {
                ua: client.handshake.headers["user-agent"],
                ip: client.handshake.address
            });
        });
    }

    /**
     * @param client
     */
    function addGhostMode(client) {
        clientEvents.forEach(addEvent);

        function addEvent(event) {
            client.on(event, data => {
                client.broadcast.emit(event, data);
            });
        }
    }

    return io;
};
