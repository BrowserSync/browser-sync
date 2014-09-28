"use strict";

var utils       = require("../../../lib/utils");

var assert      = require("chai").assert;
var sinon       = require("sinon");
var browserSync = require("../../../index");

describe("E2E OPEN Browsers options (1)", function () {

    var instance;
    var stub;

    before(function (done) {
        var config = {
            debugInfo: false,
            server: "test/fixtures",
            browser: "google chrome"
        };
        stub     = sinon.stub(utils, "open");
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
        assert.equal(args[1], "google chrome");
    });
});
describe("E2E OPEN Browsers options (multiple)", function () {

    var instance;
    var stub;

    before(function (done) {
        var config = {
            debugInfo: false,
            server: "test/fixtures",
            browser: ["google chrome", "safari"]
        };
        stub = sinon.stub(utils, "open");
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the localhost address as default", function () {

        sinon.assert.called(stub);

        var args = stub.getCall(0).args;
        assert.equal(args[0], instance.options.urls.local);
        assert.equal(args[1], "google chrome");

        args = stub.getCall(1).args;
        assert.equal(args[0], instance.options.urls.local);
        assert.equal(args[1], "safari");
    });
});
