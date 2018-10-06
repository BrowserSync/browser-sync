module.exports = function () {
    return {
        scope: {
            toggle: "&",
            item: "=",
            switchid: "@",
            title: "@",
            tagline: "@",
            active: "=",
            prop: "@"
        },
        restrict: "E",
        replace: true,
        transclude: true,
        templateUrl: "bs-switch.html",
        controllerAs: "ctrl",
        controller: ["$scope", function ($scope) {
            var ctrl = this;
            ctrl.item = $scope.item;
        }]
    };
};