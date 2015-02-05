"use strict";

var path        = require("path");
var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI server + tunnel test", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: true,
                    logLevel: "silent",
                    tunnel: true
                }
            },
            cb: function (err, out) {
                bs = out;
                done();
            }
        });
    });
    after(function () {
        bs.cleanup();
        bs.tunnel.disconnect();
    });
    it("should call init on the tunnel", function () {
        assert.include(bs.getOptionIn(["urls", "tunnel"]), "ngrok.com");
    });
});
