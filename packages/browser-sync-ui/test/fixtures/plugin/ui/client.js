(function (angular) {

    const PLUGIN_NAME = "Test Plugin";

    angular
        .module("BrowserSync")
        .directive("testPlugin", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    "options": "="
                },
                templateUrl: "test.directive.html",
                controller: ["$scope", "Socket", function ($scope, Socket) {
                    var ctrl = this;
                    ctrl.removeRestriction = function (selector) {
                        Socket.uiEvent({
                            namespace: PLUGIN_NAME,
                            event: "remove",
                            data: selector
                        });
                    };
                }],
                controllerAs: "ctrl"
            };
        });

})(angular);

