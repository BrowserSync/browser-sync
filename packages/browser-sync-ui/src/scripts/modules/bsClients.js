var angular = require('../angular');

angular
    .module("bsClients", ["bsSocket"])
    .service("Clients", ["Socket", ClientsService]);

/**
 * @param Socket
 * @returns {{reloadAll: Function, sendAllTo: Function, scrollAllTo: Function, highlight: Function}}
 * @constructor
 */
function ClientsService(Socket) {

    var api = {
        reloadAll: function () {
            Socket.clientEvent("browser:reload");
        },
        sendAllTo: function (path) {
            Socket.emit("ui", {
                namespace: "history",
                event: "sendAllTo",
                data: {
                    path: path
                }
            });
        },
        scrollAllTo: function () {
            Socket.clientEvent("scroll", {
                position: {
                    raw: 0,
                    proportional: 0
                },
                override: true
            });
        },
        highlight: function (connection) {
            Socket.emit("ui:highlight", connection);
        }
    };

    return api;
}
