/*global window*/
/*global angular*/
/*global ___socket___*/
(function (window, socket) {
    "use strict";

    var app = angular.module("BrowserSync", []);

    app.factory("Socket", function () {
        return {
            addEvent: function (name, callback) {
                socket.on(name, callback);
            },
            removeEvent: function (name, callback) {
                socket.removeListener(name, callback);
            }
        };
    });
//
//    app.controller("MainCtrl", function ($scope, Socket) {
//
//        $scope.browsers = [];
//        $scope.options  = {};
//        $scope.data = {
//            url: ""
//        };
//
//        $scope.goTo = function (url) {
//            socket.emit("cp:goTo", {url: url});
//        };
//
//        $scope.socketEvents = {
//            connection: function (options) {
//                $scope.$apply(function () {
//                    $scope.options = options;
//                });
//            }
//        };
//
//        Socket.registerEvent("connection", $scope.socketEvents.connection);
//
//    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));