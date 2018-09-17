var browserSync = require("../../../../");

var assert = require("chai").assert;
var request = require("supertest");

describe("E2E httpModule options test", function() {
    it.skip("creates server using provided httpModule", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            https: true,
            httpModule: "http2",
            open: false,
            logLevel: "silent"
        };

        browserSync.init(config, function(err, bs) {
            request(bs.options.getIn(["urls", "local"]))
                .get("/index.html")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    if(err) {
                        console.log(err);
                        return done(err);
                    }
                    assert.include(res.text, bs.options.get("snippet"));
                    bs.cleanup();
                    done();
                });
        });
    });
});
