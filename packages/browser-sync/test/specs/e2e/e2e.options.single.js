var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var fs = require("fs");
var request = require("supertest");

describe("e2e options test (single)", function() {
    it("returns index.html content for a non-existing path", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            cors: true,
            single: true
        };
        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/a-path-that-deffo-doesnot-exist")
                .set("accept", "*/*")
                .expect(200)
                .end(function(err, res) {
                    const expected = fs.readFileSync(
                        "test/fixtures/index.html",
                        "utf8"
                    );
                    assert.equal(res.text, expected);
                    bs.cleanup(done);
                });
        });
    });
    it("returns regular content for matching file path", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            cors: true,
            single: true
        };
        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/assets/style.css")
                .expect(200)
                .end(function(err, res) {
                    const expected = fs.readFileSync(
                        "test/fixtures/assets/style.css",
                        "utf8"
                    );
                    assert.equal(res.text, expected);
                    bs.cleanup(done);
                });
        });
    });
});
