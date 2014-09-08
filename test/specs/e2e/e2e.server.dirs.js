"use strict";

var browserSync = require("../../../index");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with directories", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: [
                	"test/fixtures/alt",
                	"test/fixtures",
                ],
                index: "index.htm"
            },
            debugInfo: false,
            open: false
        };

        instance = browserSync.init(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("serves files from index.htm with multiple base dirs", function (done) {

        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Hello from the test");
                done();
            });
    });

});