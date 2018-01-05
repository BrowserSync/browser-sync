var browserSync = require("../../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var request = require("supertest");

describe("Accepting single middleware as a server option", function() {
    var bs, spy;

    before(function(done) {
        browserSync.reset();
        spy = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };

        var config = {
            server: {
                baseDir: "./test/fixtures",
                middleware: fn // Back compat
            },
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 2);
    });
    it("should call the middlewares", function(done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, "/");
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Accepting single middleware as a top-level option", function() {
    var bs, spy;

    before(function(done) {
        browserSync.reset();
        spy = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };

        var config = {
            server: {
                baseDir: "./test/fixtures"
            },
            middleware: fn,
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 2);
    });
    it("should call the middlewares", function(done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, "/");
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Accepting multiple middleware as a server option", function() {
    var bs, spy, spy2;

    before(function(done) {
        browserSync.reset();
        spy = sinon.spy();
        spy2 = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };
        var fn2 = function(req, res, next) {
            spy2(req.url);
            next();
        };

        var config = {
            server: {
                baseDir: "./test/fixtures",
                middleware: [fn, fn2] // Back compat
            },
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 3);
    });
    it("should call the middlewares", function(done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, "/");
                sinon.assert.calledWithExactly(spy2, "/");
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Accepting multiple server middlewares as top-level option", function() {
    var bs, spy, spy2;

    before(function(done) {
        browserSync.reset();
        spy = sinon.spy();
        spy2 = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };
        var fn2 = function(req, res, next) {
            spy2(req.url);
            next();
        };

        var config = {
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            middleware: [fn, fn2]
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 3);
    });
    it("should call the middlewares", function(done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, "/");
                sinon.assert.calledWithExactly(spy2, "/");
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Allow middlewares to call next() after res.end if no server provided", function() {
    var bs;

    before(function(done) {
        browserSync.reset();

        var fn = function(req, res, next) {
            res.write('bs');
            res.end();
            next();
        };

        var config = {
            logLevel: "silent",
            open: false,
            middleware: fn
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("should call the middlewares", function(done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, 'bs');
                done();
            });
    });
});
