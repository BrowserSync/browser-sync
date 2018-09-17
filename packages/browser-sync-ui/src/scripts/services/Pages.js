/**
 * @type {angular}
 */
var app = require("../module");

app.service("Pages", ["pagesConfig", "$location", ContentSections]);

/**
 * @param pagesConfig
 * @param $location
 * @returns {{enable: Function, transform: Function, current: Function}}
 * @constructor
 */
function ContentSections(pagesConfig, $location) {

    return {
        /**
         * Enable a single Item
         * @param $section
         * @returns {*}
         */
        enable: function ($section) {
            angular.forEach(pagesConfig, function (item) {
                item.active = false;
            });
            $section.active = true;
            return pagesConfig;
        },
        /**
         * Transform an item
         */
        transform: function ($section, fn) {
            if (typeof fn === "function") {
                return $section = fn($section);
            } else {
                throw new TypeError("Noooo");
            }
        },
        /**
         * Get the current section based on the path
         * @returns {*}
         */
        current: function () {
            if ($location.path() === "/") {
                return pagesConfig["overview"];
            }
            var match;
            angular.forEach(pagesConfig, function (item) {
                if (item.path === $location.path()) {
                    match = item;
                }
            });
            return match;
        }
    };
}