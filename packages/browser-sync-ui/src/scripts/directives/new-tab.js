module.exports = function () {
    return {
        scope: {
            url: "@",
            mode: "@"
        },
        restrict: "E",
        replace: true,
        template: '<a href="{{url}}" bs-button="subtle-alt icon" target="_blank" title="Open a new tab" ng-show="mode !== \'snippet\'"><icon icon="newtab"></icon> New Tab </a>' //jshint:ignore
    };
};