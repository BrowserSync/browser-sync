module.exports = function () {
    return {
        scope: {
            icon: "@"
        },
        restrict: "E",
        replace: true,
        template: "<svg bs-svg-icon><use xlink:href=\"{{iconName}}\"></use></svg>",
        link: function (scope, elem, attrs) {
            scope.iconName = "#svg-" + scope.icon;
            return scope;
        }
    };
};