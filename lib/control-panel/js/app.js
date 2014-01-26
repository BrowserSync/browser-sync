/*global window*/
/*global angular*/
/*global ___socket___*/
(function (window, socket) {
    "use strict";

    var app = angular.module("browserSync", []);

//    socket.emit("context", "controlPanel");

    app.controller("MainCtrl", function ($scope) {

        $scope.browsers = [];
        $scope.options  = {};
        $scope.data = {
            url: ""
        };

        $scope.goTo = function (url) {
            socket.emit("cp:goTo", {url: url});
        };

        var socketEvents = {
            connection: function (options) {
                console.log(options);
                $scope.$apply(function () {
                    $scope.options = options;
                });
            }
        };

        socket.on("connection", socketEvents.connection);
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));