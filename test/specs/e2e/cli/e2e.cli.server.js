var path = require("path");
var request = require("supertest");
var assert = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI server test", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: false,
                    logLevel: "silent"
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("serves index.html + snippet injected", function(done) {
        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });
    it("serves browser-sync client js", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});

describe("E2E CLI server test with directory listing/index ", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: false,
                    logLevel: "silent",
                    directory: true,
                    index: "index.htm"
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("Sets the correct server options", function() {
        assert.equal(instance.options.getIn(["server", "directory"]), true);
        assert.equal(
            instance.options.getIn(["server", "serveStaticOptions", "index"]),
            "index.htm"
        );
    });
});

describe("E2E CLI server test with extensions option - single", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: false,
                    logLevel: "silent",
                    extensions: "html"
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("Sets the extensions option (array) for serve static", function() {
        assert.equal(
            instance.options.getIn(["server", "serveStaticOptions", "index"]),
            "index.html"
        );
        assert.deepEqual(
            instance.options
                .getIn(["server", "serveStaticOptions", "extensions"])
                .toJS(),
            ["html"]
        );
    });
});

describe("E2E CLI server test with extensions option - multiple", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: false,
                    logLevel: "silent",
                    extensions: "html,css"
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("Sets the extensions option (array) for serve static", function() {
        assert.equal(
            instance.options.getIn(["server", "serveStaticOptions", "index"]),
            "index.html"
        );
        assert.deepEqual(
            instance.options
                .getIn(["server", "serveStaticOptions", "extensions"])
                .toJS(),
            ["html", "css"]
        );
    });
});
