/*global window*/
/*global angular*/
/*global ___socket___*/
(function (window, socket) {
    "use strict";
    var app = angular.module("browserSync", []);

    socket.emit("context", "controlPanel");

    app.controller("MainCtrl", function ($scope) {

        $scope.browsers = [];
        $scope.options  = {};

        var socketEvents = {
            init: function (data) {
                $scope.$apply(function () {
                    $scope.options = data.options;
                });
            },
            connection: function (data) {
                $scope.$apply(function () {
                    $scope.browsers.push(data.browser);
                });
            }
        };

        socket.on("controlPanel:init", socketEvents.init);
        socket.on("controlPanel:connection", socketEvents.connection);
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));