var angular = require('../angular');

angular
    .module('bsNotify', [])
    .directive("notifyElem", function () {
        return {
            restrict: "E",
            scope: {},
            template: "<div bs-notify ng-class=\"{\'active\': ui.visible}\">\n    <p class=\"notification__text\">{{ui.heading}} <span class=\"color--lime\">{{ui.message}}</span></p>\n</div>",
            controller: ["$scope", "$rootScope", notifyController]
        };
    });

/**
 * Notify
 * @param $scope
 * @param $rootScope
 */
function notifyController($scope, $rootScope) {

    /**
     * Default settings
     */
    var DEFAULT_STATUS = "info";
    var DEFAULT_HEADING = "Browsersync:";
    var DEFAULT_MESSAGE = "Welcome to Browsersync";
    var DEFAULT_TIMEOUT = 2000;

    /**
     * Default state
     * @type {{visible: boolean, status: string, heading: string, text: string}}
     */
    $scope.ui = {
        status: DEFAULT_STATUS,
        heading: DEFAULT_HEADING,
        message: DEFAULT_MESSAGE
    };

    /**
     * @param evt
     * @param data
     */
    $scope.show = function (evt, data) {

        data = data || {};

        /**
         *
         * Clear any previous timers
         *
         */
        if ($scope._timer) {
            clearTimeout($scope._timer);
        }

        /**
         *
         * Set a reset timer
         *
         */
        $scope._timer = window.setTimeout($scope.reset, data.timeout || DEFAULT_TIMEOUT);

        /**
         *
         * Set UI flags
         *
         */
        $scope.ui.visible = true;
        $scope.ui.status = data.status || DEFAULT_STATUS;
        $scope.ui.heading = data.heading || DEFAULT_HEADING;
        $scope.ui.message = data.message || DEFAULT_HEADING;
    };

    /**
     * Reset the UI
     */
    $scope.reset = function () {
        $scope.ui.visible = false;
        $scope.$digest();
    };

    /**
     * Listen to events on the $rootScope
     */
    $rootScope.$on("notify:flash", $scope.show);
}
