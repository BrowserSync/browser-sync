"use strict";


var browser1 = {
    name: "Chrome",
    version: "32.0.1700.107",
    width: 100,
    height: 200
};
var browser2 = {
    name: "Firefox",
    version: "12.322",
    width: 800,
    height: 212
};

describe("Main Controller", function () {

    beforeEach(module("BrowserSync"));

    var mainCtrl;
    var scope;
    var socket;
    var spy;

    before(function () {
//        spy = sinon.spy();
    });

    beforeEach(inject(function ($rootScope, $controller, $injector) {
        scope = $rootScope.$new();

        socket = $injector.get("Socket");
        spy = sinon.spy(socket, "addEvent");
        mainCtrl = $controller("MainCtrl", {
            $scope: scope
        });

    }));

    afterEach(function () {
//        spy.reset();
    });

    it("should be available", function () {
        assert.isDefined(mainCtrl);
    });
    it("should have an empty options object", function () {
        assert.isDefined(scope.options);
    });
    it("should have an empty browsers object", function () {
        assert.isDefined(scope.browsers);
    });
    it("should have a socketEvents object on the scope", function () {
        assert.isDefined(scope.socketEvents);
    });
    it("should have a socketEvents.connection callback", function () {
        assert.isDefined(scope.socketEvents.connection);
    });
    it("should add the connection event", function () {
        sinon.assert.calledWithExactly(spy, "connection", scope.socketEvents.connection);
    });

    // EVENTS
    it("should add options received from socket the scope", function () {
        scope.socketEvents.connection({name: "shane"});
        assert.equal(scope.options.name, "shane");
    });
    it("should add a single browser to the scope", function () {
        scope.socketEvents.addBrowser(browser1);
        assert.equal(scope.browsers.length, 1);
        assert.equal(scope.browsers[0].name, "Chrome");
    });
    it("should add mulitple browsers to the scope", function () {
        scope.socketEvents.addBrowser(browser1);
        scope.socketEvents.addBrowser(browser2);
        assert.equal(scope.browsers.length, 2);
        assert.equal(scope.browsers[0].name, "Chrome");
        assert.equal(scope.browsers[1].name, "Firefox");
    });
});