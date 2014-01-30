/*global window*/
/*global angular*/
/*global ___socket___*/
(function (window, socket) {
    "use strict";

    var app = angular.module("BrowserSync", []);

    /**
     * Socket Factory
     */
    app.service("Socket", function () {
        return {
            addEvent: function (name, callback) {
                socket.on(name, callback);
            },
            removeEvent: function (name, callback) {
                socket.removeListener(name, callback);
            }
        };
    });


    /**
     * Options Factory
     */
    app.service("Options", function () {
        return {

        };
    });

    app.controller("MainCtrl", function ($scope, Socket) {

        $scope.options  = {};

        $scope.socketEvents = {
            connection: function (options) {
                $scope.$apply(function () {
                    $scope.options = options;
                });
            }
        };

        Socket.addEvent("connection", $scope.socketEvents.connection);
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));