var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var dns = require("dns");

describe("E2E online test", function() {
    it("Sets `online: false` if google.com lookup fails", function(done) {
        browserSync.reset();
        var stub = sinon.stub(dns, "resolve").yields("ERR");
        delete process.env.TESTING;
        var instance = browserSync(
            {
                open: false,
                logLevel: "silent"
            },
            function(err, bs) {
                assert.isFalse(bs.options.get("online"));
                instance.cleanup();
                stub.restore();
                process.env.TESTING = true;
                done();
            }
        );
    });
    it("Sets `online: true` if google.com lookup succeeds", function(done) {
        browserSync.reset();
        var stub = sinon.stub(dns, "resolve").yields(null);
        delete process.env.TESTING;
        var instance = browserSync(
            {
                open: false,
                logLevel: "silent"
            },
            function(err, bs) {
                assert.isTrue(bs.options.get("online"));
                instance.cleanup();
                stub.restore();
                process.env.TESTING = true;
                done();
            }
        );
    });
});
