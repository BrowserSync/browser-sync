var browserSync = require("../../../../");

var sinon = require("sinon");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test with only a callback", function() {
    var instance;
    var stub;

    before(function(done) {
        browserSync.reset();
        stub = sinon.spy(console, "log");
        instance = browserSync(done).instance;
    });

    after(function() {
        instance.cleanup();
        console.log.restore();
    });

    it("returns the script", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});

describe("E2E server test with config & callback", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent"
        };

        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Can return the script", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});
