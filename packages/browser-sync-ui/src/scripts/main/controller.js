var app    = require("../module");

app.controller("MainController", [
    "$scope",
    "$rootScope",
    "$location",
    "$injector",
    MainController
]);


/**
 * @param $scope
 * @param $rootScope
 * @param $location
 * @param $injector
 * @constructor
 */
function MainController ($scope, $rootScope, $location, $injector) {

    var ctrl      = this;
    ctrl.options  = false;
    ctrl.browsers = [];
    ctrl.socketId = "";

    var pagesConfig = $injector.get("pagesConfig");
    var Pages       = $injector.get("Pages");
    var Socket      = $injector.get("Socket");
    var Clients     = $injector.get("Clients");

    ctrl.ui = {
        menu:         pagesConfig,
        sectionMenu:  false,
        disconnected: false
    };

    /**
     * @param $section
     */
    ctrl.setActiveSection = function ($section) {
        Pages.enable($section);
        $location.path($section.path);
        ctrl.ui.sectionMenu = false;
    };

    /**
     * Refresh all event
     */
    ctrl.reloadAll = function () {
        Clients.reloadAll();
        $rootScope.$emit("notify:flash", {
            heading: "Instruction sent:",
            message: "Reload All Browsers  ✔"
        });
    };

    /**
     * @param value
     */
    ctrl.scrollAllTo = function () {
        Clients.scrollAllTo(0);
        $rootScope.$emit("notify:flash", {
            heading: "Instruction sent:",
            message: "Scroll all browsers to Y=0  ✔"
        });
    };

    /**
     * Emit the socket event
     */
    ctrl.sendAllTo = function (path) {
        Clients.sendAllTo(path);
        $rootScope.$emit("notify:flash", {
            heading: "Instruction sent:",
            message: "Reset all Browsers to /"
        });
    };

    /**
     *
     */
    ctrl.toggleMenu = function () {
        ctrl.ui.sectionMenu = !ctrl.ui.sectionMenu;
    };

    /**
     * @type {{connection: connection, addBrowsers: addBrowsers}}
     */
    ctrl.socketEvents = {

        /**
         * @param options
         */
        connection: function (options) {
            ctrl.update(options);
        },
        /**
         *
         */
        disconnect: function () {
            ctrl.ui.disconnected = true;
        }
    };

    /**
     * Update the current $scope
     */
    ctrl.update = function (options) {

        ctrl.options = transformOptions(options);
        ctrl.ui.disconnected = false;

        Pages.transform(pagesConfig["overview"], function ($section) {
            return $section;
        });
    };

    /**
     * Set the currently active page
     */
    ctrl.setActiveSection(Pages.current());

    /**
     * Get options from socket connection
     */
    Socket.options().then(ctrl.socketEvents.connection);

    /**
     * React to disconnects
     */
    $rootScope.$on("ui:disconnect", ctrl.socketEvents.disconnect);
    $rootScope.$on("ui:connection", function (evt, options) {
        ctrl.socketEvents.connection(options);
        $scope.$digest();
    });
}

/**
 * Options transformations
 * @param options
 * @returns {*}
 */
function transformOptions(options) {

    options.displayUrl = getDisplayUrl(options.urls);

    return options;
}

/**
 * @param urls
 * @returns {*}
 */
function getDisplayUrl (urls) {
    if (!urls) {
        return false;
    }
    return urls.external || urls.local;
}