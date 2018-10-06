var browserSync = require("../../../../");

var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;
var client = require("socket.io-client");

describe("E2E proxy test", function() {
    var instance, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: proxytarget,
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
        server.close();
    });

    it("can init proxy & serve a page", function(done) {
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, options.get("snippet"));
                done();
            });
    });

    it.skip("Can proxy websockets", function(done) {
        var called;
        instance.io.sockets.on("connection", function() {
            if (!called) {
                called = true;
                done();
            }
        });

        var options = instance.options.toJS();
        var connectionUrl = options.urls.local + options.socket.namespace;
        var clientSockets = client(connectionUrl, {
            path: options.socket.path
        });

        clientSockets.emit("shane", { name: "shane" });
    });

    it("Can serve the script", function(done) {
        request(instance.server)
            .get(options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });

    it("Can serve files with snippet added", function(done) {
        request(options.getIn(["urls", "local"]))
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });
});

describe("E2E proxy test (2)", function() {
    var instance, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: proxytarget + "/forms.html",
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
        server.close();
    });

    it("Can serve the script", function() {
        assert.equal(instance.options.get("startPath"), "/forms.html");
    });
});

describe("E2E proxy test with proxyRes option", function() {
    var instance, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: {
                target: proxytarget,
                proxyRes: [
                    function(res) {
                        res.headers["cache-control"] = "private"; // default is 'public, max-age=0'
                    }
                ]
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
        server.close();
    });

    it("Can override the cache-control header", function(done) {
        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.headers["cache-control"], "private");
                done();
            });
    });
});

describe("E2E proxy test with object option", function() {
    var instance, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: {
                target: proxytarget
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
        server.close();
    });

    it("Can serve the script", function(done) {
        request(instance.server)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, options.get("snippet"));
                done();
            });
    });
});
