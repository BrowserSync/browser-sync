var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var request = require("supertest");

describe("e2e options test (cors)", function() {
    it("Adds cors middleware", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            cors: true
        };
        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/index.html")
                .expect(200)
                .end(function(err, res) {
                    assert.equal(
                        res.headers["access-control-allow-origin"],
                        "*"
                    );
                    assert.equal(
                        res.headers["access-control-allow-methods"],
                        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
                    );
                    assert.equal(
                        res.headers["access-control-allow-headers"],
                        "X-Requested-With,content-type"
                    );
                    assert.equal(
                        res.headers["access-control-allow-credentials"],
                        "true"
                    );
                    bs.cleanup();
                    done();
                });
        });
    });
});
