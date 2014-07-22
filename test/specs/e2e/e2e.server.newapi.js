"use strict";

var browserSync   = require("../../../index");

var sinon   = require("sinon");
var request = require("supertest");
var _       = require("lodash");
var assert  = require("chai").assert;

describe("E2E server test with only a callback", function () {

    var instance;
    var stub;

    before(function (done) {
        stub = sinon.stub(console, "log");
        instance = browserSync(done);
    });

    after(function () {
        instance.cleanup();
        stub.restore();
    });

    it("Can return the script", function () {

        console.log(instance.options);
//        request(instance.server)
//            .get(instance.options.scriptPaths.versioned)
//            .expect(200)
//            .end(function (err, res) {
//                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
//                done();
//            });
    });
});


describe("E2E server test with only a config option", function () {

    var instance;

    before(function (done) {

        var called;

        instance = browserSync({
            open: false,
            debugInfo: false,
            server: {
                baseDir: "test/fixtures"
            }
        });

        instance.events.on("init", function (bs) {
            if (!called) {
                done();
                called = true;
            }
        });
    });

    after(function () {
        instance.cleanup();
    });

    it("Can return the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
                done();
            });
    });
});