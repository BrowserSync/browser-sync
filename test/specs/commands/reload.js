"use strict";

var path        = require("path");
var browserSync = require(path.resolve("./"));

var pkg         = require(path.resolve("package.json"));
var sinon       = require("sinon");
var cli         = require(path.resolve(pkg.bin));

describe("E2E CLI `reload` with no files arg", function () {

    it("should make a http request to the protocol with no files arg", function (done) {
        browserSync.reset();
        browserSync
            .create()
            .init({server: "test/fixtures", open: false}, function (err, bs) {

                var spy = sinon.spy(bs.events, "emit");

                cli({
                    cli: {
                        input: ["reload"],
                        flags: {
                            port: bs.options.get("port")
                        }
                    },
                    cb: function () {
                        sinon.assert.calledWithExactly(spy, "browser:reload");
                        bs.cleanup();
                        done();
                    }
                });
            });
    });

    it("should make a http request with files arg", function (done) {

        browserSync.reset();

        browserSync
            .create()
            .init({server: "test/fixtures", open: false}, function (err, bs) {

                var spy = sinon.spy(bs.events, "emit");

                cli({
                    cli: {
                        input: ["reload"],
                        flags: {
                            port: bs.options.get("port"),
                            files: "core.css"
                        }
                    },
                    cb: function () {
                        sinon.assert.calledWithExactly(spy, "file:changed", {path: "core.css", log: true, namespace: "core"});
                        bs.cleanup();
                        done();
                    }
                });
            });
    });
});
