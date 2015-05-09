"use strict";

var browserSync = require("../../../index");
var request = require("request");
var assert = require("chai").assert;
var sinon = require("sinon");
var proto = require("../../../lib/http-protocol");

describe("HTTP protocol", function () {

    var bs, spy;

    before(function (done) {

        browserSync.reset();

        var config = {
            server:   "test/fixtures",
            logLevel: "info",
            open:     false,
            online:   false
        };

        bs = browserSync.init(config, done).instance;

        spy = sinon.spy(bs.events, "emit");
    });

    afterEach(function () {
        spy.reset();
    });

    after(function () {
        bs.cleanup();
    });

    it("responds to reload event with no args", function (done) {

        var url = proto.getUrl({method: "reload"}, bs.options.getIn(["urls", "local"]));

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "browser:reload");
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: undefined");
            done();
        });
    });
    it("responds to reload event with multi file paths", function (done) {

        var url = proto.getUrl({method: "reload", args: ["a.css", "b.css"]}, bs.options.getIn(["urls", "local"]));

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "file:changed");
            sinon.assert.calledWithExactly(spy, "file:changed", {
                path: "a.css",
                basename: "a.css",
                ext: "css",
                log: true,
                namespace: "core",
                event: "change"
            });
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: [\"a.css\",\"b.css\"]");
            done();
        });
    });
    it("responds to reload event with single file path", function (done) {

        var url = proto.getUrl({method: "reload", args: "somefile.php"}, bs.options.getIn(["urls", "local"]));

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "file:changed");
            sinon.assert.calledWithExactly(spy, "file:changed", {
                path: "somefile.php",
                basename: "somefile.php",
                ext: "php",
                log: true,
                namespace: "core",
                event: "change"
            });
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: \"somefile.php\"");
            done();
        });
    });
    it("Gives a nice error when method not found", function (done) {

        var url = proto.getUrl({method: "relzoad", args: "somefile.php"}, bs.options.getIn(["urls", "local"]));

        request(url, function (e, r, body) {
            assert.equal(r.statusCode, 404);
            assert.equal(body, "Public API method `relzoad` not found.");
            done();
        });
    });

    it("Gives a nice error when no params are given", function (done) {

        var url = proto.getUrl(undefined, bs.options.getIn(["urls", "local"]));

        request(url, function (e, r, body) {
            assert.equal(r.statusCode, 500);
            assert.include(body, "Error: No Parameters were provided.");
            done();
        });
    });
});
