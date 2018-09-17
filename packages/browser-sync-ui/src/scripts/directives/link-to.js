module.exports = function () {
    return {
        restrict:   "E",
        replace:    false,
        transclude: true,
        scope:      {
            "path": "@"
        },
        template:   "<a href='#' ng-click='navi(path)' ng-transclude=''>as</a>",
        controller: ["$scope", "$location", "$injector", function ($scope, $location, $injector) {

            var pages = $injector.get("pagesConfig");
            var Pages = $injector.get("Pages");

            $scope.navi = function (path) {
                var item = pages[path];
                Pages.enable(item);
                $location.path(path);
            };
        }]
    };
};