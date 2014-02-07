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

        $scope.options = false;
        $scope.browsers = [];

        $scope.socketEvents = {
            connection: function (options) {
                $scope.$apply(function () {
                    $scope.options = options;
                });
            },
            addBrowser: function (browser) {
                $scope.$apply(function () {
                    $scope.browsers.push(browser);
                });
            }
        };

        Socket.addEvent("connection", $scope.socketEvents.connection);
        Socket.addEvent("browser:add", $scope.socketEvents.addBrowser);
    });

    app.directive("urlInfo", function () {
        return {
            restrict: "E",
            scope: {
                options: "="
            },
            template: "<h1><small>{{type}} running at: </small><a href=\"{{url}}\" target='_blank'>{{url}}</h1></a>",
            controller: function ($scope) {
                $scope.url = "http:" + $scope.options.url;
                $scope.type = $scope.options.server ? "Server" : "Proxy";
            }
        };
    });

}(window, (typeof ___socket___ === "undefined") ? {} : ___socket___));