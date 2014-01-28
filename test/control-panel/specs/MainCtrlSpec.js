"use strict";

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
});