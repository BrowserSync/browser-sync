var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test with directory listings", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: ["test/fixtures/alt", "test/fixtures"],
                index: "index.htm"
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("serves files from index.htm with multiple base dirs", function(done) {
        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "Hello from the test");
                done();
            });
    });
});
describe("E2E server test with base dir option", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "./test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Serves files when baseDir given with leading dot.", function(done) {
        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "<title>Test HTML Page</title>");
                done();
            });
    });
});

describe("E2E server test with base dir array option", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: ["./test/fixtures", "./test/fixtures/alt"],
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Serves files when baseDir given with leading dot.", function(done) {
        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "<title>Test HTML Page</title>");
                done();
            });
    });
});

describe("E2E server test with base dir array option + directory", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: ["test", "app"],
                directory: true
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Serves files when baseDir given with leading dot.", function(done) {
        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "listing directory /");
                done();
            });
    });
});
