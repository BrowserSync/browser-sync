import {Server} from "socket.io";
import * as utils from "./server/utils";

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
export function plugin(server, clientEvents, bs) {
    return exports.init(server, clientEvents, bs);
}

/**
 * @param {http.Server} server
 * @param clientEvents
 * @param {BrowserSync} bs
 */
export function init(server, clientEvents, bs) {
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

    const io = new Server();
    io.attach(server, {
      ...socketIoConfig,
      pingTimeout: socketConfig.clients.heartbeatTimeout,
      cors: {
          credentials: true,
          "origin": (origin, cb) => {
            return cb(null, origin)
          },
      }
    });

    io.of(socketConfig.namespace).on('connection', (socket) => {
        handleConnection(socket);
    });

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
            ua: client.handshake.headers["user-agent"]
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

    // @ts-ignore
    io.sockets = io.of(socketConfig.namespace)

    return io;
}
