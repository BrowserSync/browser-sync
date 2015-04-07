"use strict";

var browserSync = require("../../../index");
var request     = require("request");
var assert      = require("chai").assert;
var sinon       = require("sinon");
var proto       = require("../../../lib/http-protocol");

describe("HTTP protocol", function () {

    var bs, spy;

    before(function (done) {

        browserSync.reset();

        var config = {
            server: "test/fixtures",
            logLevel: "info",
            open: false,
            online: false
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

        var url = proto.getUrl({method: "reload"}, bs);

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "browser:reload");
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: undefined");
            done();
        });
    });
    it("responds to reload event with multi file paths", function (done) {

        var url = proto.getUrl({method: "reload", args: ["core.min.css", "core.css"]}, bs);

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "file:changed");
            sinon.assert.calledWithExactly(spy, "file:changed", { path: "core.min.css", log: true, namespace: "core" });
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: [\"core.min.css\",\"core.css\"]");
            done();
        });
    });
    it("responds to reload event with single file path", function (done) {

        var url = proto.getUrl({method: "reload", args: "somefile.php"}, bs);

        request(url, function (e, r, body) {
            sinon.assert.calledWith(spy, "file:changed");
            sinon.assert.calledWithExactly(spy, "file:changed", { path: "somefile.php", log: true, namespace: "core" });
            assert.include(body, "Called public API method `.reload()`");
            assert.include(body, "With args: \"somefile.php\"");
            done();
        });
    });
});
