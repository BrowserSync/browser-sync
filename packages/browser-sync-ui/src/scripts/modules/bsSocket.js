var angular = require('../angular');
var socket = require('socket.io-client');
var socketConfig = window.___browserSync___.socketConfig;
var socketUrl = window.___browserSync___.socketUrl;
var io = socket(socketUrl, socketConfig);

angular
    .module("bsSocket", [])
    .service("Socket", ["$q", "$rootScope", SocketService]);

function SocketService($q, $rootScope) {

    var deferred = $q.defer();
    var session;

    io.on("connection", function (out) {
        session = out.session;
        $rootScope.$emit("ui:connection", out);

        deferred.resolve(out, this);

        if (window.name === '') {
            window.name = JSON.stringify({id: socket.id});
        } else {
            var prev = JSON.parse(window.name);
            //console.log(prev, socket);
            if (prev.id !== socket.id) {
                //console.log('new session');
            } else {
                //console.log('page reload');
            }
            //console.log(JSON.parse(window.name));
        }
    });

    io.on("disconnect", function () {
        $rootScope.$emit("ui:disconnect");
    });

    var publicApi = {
        on: function (name, callback) {
            io.on(name, callback);
        },
        off: function (name, callback) {
            io.off(name, callback);
        },
        removeEvent: function (name, callback) {
            io.removeListener(name, callback);
        },
        emit: function (name, data) {
            io.emit(name, data || {});
        },
        /**
         * Proxy client events
         * @param name
         * @param data
         */
        clientEvent: function (name, data) {
            io.emit("ui:client:proxy", {
                event: name,
                data: data
            });
        },
        options: function () {
            return deferred.promise;
        },
        getData: function (name) {
            var deferred = $q.defer();
            io.on("ui:receive:" + name, function (data) {
                deferred.resolve(data);
            });
            io.emit("ui:get:" + name);
            return deferred.promise;
        },
        uiEvent: function (evt) {
            io.emit("ui", evt);
        },
        newSession: function () {

        }
    };

    Object.defineProperty(publicApi, 'sessionId', {
        get: function () {
            return session
        }
    });

    return publicApi;
}
