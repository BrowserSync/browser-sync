var browserSync = require("../../../../");
var assert = require("chai").assert;
var request = require("supertest");

describe("Accepting middleware as an option (1)", function() {
    var bs;

    before(function(done) {
        browserSync.reset();

        var mw = function(req, res) {
            res.end("<html><body></body></html>");
        };

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            middleware: mw, // single function given
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("should accept middlewares when given as top-level", function() {
        assert.equal(
            bs.options.get("middleware").size,
            2,
            "1 custom + 1 serve static"
        );
    });
});

describe("Accepting middleware as an option (2)", function() {
    var bs;

    before(function(done) {
        browserSync.reset();

        var mw1 = function(req, res) {
            res.end("<html><body></body></html>");
        };
        var mw2 = function(req, res) {
            res.end("<html><body></body></html>");
        };

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            middleware: [mw1, mw2], // single function given
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("should accept middlewares when given as top-level", function() {
        assert.equal(
            bs.options.get("middleware").size,
            3,
            "2 custom + 1 serve static"
        );
    });
});

describe("Accepting middleware as a plain object", function() {
    it("should accept middlewares with routes", function(done) {
        browserSync.reset();

        var called = 0;
        var mw1 = function myMiddleware(req, res, next) {
            called += 1;
            next();
        };
        var mw2 = function bodyResp(req, res) {
            called += 1;
            res.end("<html><body>MW2</body></html>");
        };
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            middleware: [
                mw1,
                {
                    route: "/shane",
                    handle: mw2
                }
            ],
            logLevel: "silent",
            open: false
        };

        browserSync.init(config, function(err, bs) {
            request(bs.options.getIn(["urls", "local"]))
                .get("/")
                .set("accept", "text/html")
                .expect(200)
                .end(function() {
                    assert.equal(called, 1, "should call the first middleware");
                    bs.cleanup();
                    done();
                });
        });
    });
});
