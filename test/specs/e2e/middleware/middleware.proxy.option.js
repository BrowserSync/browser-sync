var browserSync = require("../../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var connect = require("connect");
var request = require("supertest");

describe("Accepting single middleware as a proxy option", function() {
    it("should call the middleware", function(done) {
        var path = "/forms.html";

        browserSync.reset();

        var app = connect();
        app.use(require("serve-static")("./test/fixtures"));

        var server = app.listen();
        var spy = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };

        var config = {
            proxy: {
                target: "http://localhost:" + server.address().port,
                middleware: fn // Back compat
            },
            logLevel: "silent",
            open: false
        };

        browserSync.init(config, function(err, bs) {
            assert.equal(bs.options.get("middleware").size, 2);

            request(bs.server)
                .get(path)
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    sinon.assert.calledWithExactly(spy, path);
                    assert.include(res.text, bs.options.get("snippet"));

                    bs.cleanup(function() {
                        server.close();
                        done();
                    });
                });
        });
    });
    it("can add middleware at run-time", function(done) {
        var path = "/forms.html";

        browserSync.reset();

        var app = connect();
        app.use(require("serve-static")("./test/fixtures"));

        var server = app.listen();
        var spy = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };

        var config = {
            proxy: "http://localhost:" + server.address().port,
            logLevel: "silent",
            open: false
        };

        browserSync.init(config, function(err, bs) {
            bs.addMiddleware("*", fn);

            request(bs.server)
                .get(path)
                .set("accept", "text/html")
                .expect(200)
                .end(function() {
                    sinon.assert.calledWithExactly(spy, path);

                    bs.cleanup(function() {
                        server.close();
                        done();
                    });
                });
        });
    });
});

describe("Accepting single middleware as a top-level proxy option", function() {
    var bs, spy, server;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(require("serve-static")("./test/fixtures"));

        server = app.listen();

        spy = sinon.spy();

        var fn = function(req, res, next) {
            spy(req.url);
            next();
        };

        var config = {
            proxy: {
                target: "http://localhost:" + server.address().port
            },
            middleware: fn, // Back compat
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
        server.close();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 2);
    });
    it("should call the middlewares", function(done) {
        var path = "/forms.html";
        request(bs.server)
            .get(path)
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, path);
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Accepting multiple middlewares as a proxy option", function() {
    var bs, spy, spy2, server;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(require("serve-static")("./test/fixtures"));

        server = app.listen();

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
            proxy: {
                target: "http://localhost:" + server.address().port,
                middleware: [fn, fn2] // Back compat
            },
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
        server.close();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 3);
    });
    it("should call the middlewares", function(done) {
        var path = "/forms.html";
        request(bs.server)
            .get(path)
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, path);
                sinon.assert.calledWithExactly(spy2, path);
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});

describe("Accepting multiple middlewares as a proxy option", function() {
    var bs, spy, spy2, server;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(require("serve-static")("./test/fixtures"));

        server = app.listen();

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
            proxy: {
                target: "http://localhost:" + server.address().port
            },
            middleware: [fn, fn2], // Back compat
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
        server.close();
    });

    it("serves files from the middleware with snippet added", function() {
        assert.equal(bs.options.get("middleware").size, 3);
    });
    it("should call the middlewares", function(done) {
        var path = "/forms.html";
        request(bs.server)
            .get(path)
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                sinon.assert.calledWithExactly(spy, path);
                sinon.assert.calledWithExactly(spy2, path);
                assert.include(res.text, bs.options.get("snippet"));
                done();
            });
    });
});
