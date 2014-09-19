"use strict";

var browserSync = require("../../../index");
var utils       = require("../../../lib/utils");

var assert      = require("chai").assert;
var sinon       = require("sinon");


describe("E2E OPEN options", function () {

    var instance;
    var stub;

    before(function (done) {
        var config = {
            debugInfo: false,
            server: "test/fixtures"
        };
        stub = sinon.stub(utils, "open");
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the localhost address as default", function () {
        var args = stub.getCall(0).args;
        sinon.assert.called(stub);
        assert.equal(args[0], instance.options.urls.local);
    });
});

describe("E2E OPEN options with external", function () {

    var instance;
    var stub;

    before(function (done) {
        var config = {
            debugInfo: false,
            server: "test/fixtures",
            open: "external"
        };
        stub = sinon.stub(utils, "open");
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the external address when specified in options", function () {
        if (instance.options.online) {
            var args = stub.getCall(0).args;
            sinon.assert.called(stub);
            assert.equal(args[0], instance.options.urls.external);
        }
    });
});
