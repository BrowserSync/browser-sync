"use strict";

var path        = require("path");
//var utils       = require("../../../lib/utils");
//var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg         = require(path.resolve("package.json"));
var sinon       = require("sinon");
var cli         = require(path.resolve(pkg.bin));

describe.skip("E2E CLI `reload` with no files arg", function () {
    it("should make a http request to the protocol", function (done) {

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
                        sinon.assert.called(spy);
                        done();
                    }
                });
            });
    });
});
