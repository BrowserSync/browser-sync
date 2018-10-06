////
//var browserSync = require("../../../");
//var snippetUtils       = require("../../../dist/snippetUtils");
//
//var assert      = require("chai").assert;
//var sinon       = require("sinon");
//
//describe("E2E Fail tests", function () {
//    var stub;
//    before(function () {
//        stub  = sinon.stub(process, "exit");
//    });
//    beforeEach(function () {
//        browserSync.reset();
//    });
//    after(function () {
//        stub.restore();
//    });
//    it("Should fail if server + proxy config given", function (done) {
//        browserSync({
//            open: false,
//            server: true,
//            proxy: "localhost:8080"
//        }, function (err, bs) {
//            bs.cleanup();
//            assert.include(err.message, "Invalid config. You cannot specify both server & proxy options.");
//            done();
//        });
//    });
//    it("should fail if empty port cannot be found", function (done) {
//
//        var stub = sinon.stub(snippetUtils, "getPorts").yields(new Error("NOPE"));
//
//        browserSync({
//            open: false
//        }, function (err, bs) {
//            assert.include(err.message, "NOPE");
//            bs.cleanup();
//            stub.restore();
//            done();
//        });
//    });
//});
