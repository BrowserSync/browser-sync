"use strict";

var browserSync = require("../../../index");
var utils       = require("../../../lib/utils");

var assert      = require("chai").assert;
var sinon       = require("sinon");

describe("E2E Fail tests", function () {
    var stub;
    before(function () {
        stub  = sinon.stub(process, "exit");
    });
    beforeEach(function () {
        browserSync.reset();
    });
    after(function () {
        stub.restore();
    });
    it("Should fail if server + proxy config given", function (done) {
        browserSync({
            open: false,
            server: true,
            proxy: "localhost:8080"
        }, function (err) {
            assert.include(err.message, "Invalid config. You cannot specify both a server & proxy option.");
            done();
        });
    });
    it("should fail if empty port cannot be found", function (done) {

        var Q = require("q");
        var deff = new Q.defer();
        deff.reject("PORT ERROR");

        var stub = sinon.stub(utils, "getPorts").returns(deff.promise);

        browserSync({
            open: false
        }, function (err) {
            assert.include(err.message, "PORT ERROR");
            stub.restore();
            done();
        });
    });
});
