var browserSync = require("../../../");

var assert = require("chai").assert;
var path = require("path");
var request = require("supertest");
var http = require("http");
var connect = require("connect");
var serveStatic = require("serve-static");

describe("Plugins: Should be able to add Middlewares with paths on the fly", function() {
    var PLUGIN_NAME = "KITTENZ";
    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("/shane", function(req, res) {
                    res.end("shane is dev");
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "shane is dev");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to add Middlewares with no paths on the fly", function() {
    var PLUGIN_NAME = "KITTENZ";

    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("*", function(req, res) {
                    res.end("shane is dev");
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane") // this matches no static files, so will call through to middleware
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "shane is dev");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to add overriding middlewares on the fly", function() {
    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware(
                    "*",
                    function testMiddlewareAdditions(req, res) {
                        res.end("shane is dev");
                    },
                    { override: true, id: "bs-mw" }
                );
            },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config, function() {
            done();
        }).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("should serve the overriding mw file", function(done) {
        assert.equal(instance.app.stack[0].id, "bs-mw");
        request(instance.server)
            .get("/index.html") // should normally match index.html and return it
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "shane is dev");
                done();
            });
    });
    it("should remove the overrriding mw", function(done) {
        var countBefore = instance.app.stack.length;
        instance.removeMiddleware("bs-mw");
        assert.equal(countBefore - 1, instance.app.stack.length);

        request(instance.server)
            .get("/index.html") // should normally match index.html and return it
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.notInclude(res.text, "shane is dev");
                done();
            });
    });
});

describe("Plugins: Should be able to add Middlewares with paths on the fly in snippet mode", function() {
    var PLUGIN_NAME = "KITTENZ";

    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("/shane", function(req, res) {
                    res.end("shane is dev");
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "shane is dev");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to add Middlewares with no path on the fly in snippet mode", function() {
    var PLUGIN_NAME = "KITTENZ";
    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("*", function(req, res) {
                    res.end("shane is dev");
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "shane is dev");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to add middleware with paths on the fly in proxy mode", function() {
    var PLUGIN_NAME = "KITTENZ";

    it("should serve the file + browserSync file", function(done) {
        browserSync.reset();

        var testApp = connect().use(
            serveStatic(path.join(__dirname, "../../fixtures"))
        );

        // server to proxy
        var stubServer = http.createServer(testApp).listen();
        var port = stubServer.address().port;

        var config = {
            logLevel: "silent",
            open: false,
            proxy: "http://localhost:" + port
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("/shane", function(req, res) {
                    res.end("shane");
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "shane");
                    bs.cleanup();
                    stubServer.close();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to add middleware with no paths on the fly in proxy mode", function() {
    var PLUGIN_NAME = "KITTENZ";
    var instance;
    var stubServer;

    before(function(done) {
        browserSync.reset();

        var testApp = connect().use(
            serveStatic(path.join(__dirname, "/../../fixtures"))
        );

        // server to proxy
        stubServer = http.createServer(testApp).listen();
        var port = stubServer.address().port;

        var config = {
            logLevel: "silent",
            open: false,
            proxy: "http://localhost:" + port,
            online: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.addMiddleware("/shane", function(req, res) {
                    res.end("shane");
                });
                done();
            },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config).instance;
    });
    after(function() {
        instance.cleanup();
        stubServer.close();
    });
    it("should serve the file + browserSync file", function(done) {
        request(instance.server)
            .get("/shane")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "shane");
                done();
            });
    });
    it("should still proxy after middleware added", function(done) {
        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "<title>Test HTML Page</title>");
                done();
            });
    });
});

describe("Plugins: does not blow up if middleware added before app ready", function() {
    it("returns early if not active", function() {
        browserSync.reset();
        var first = browserSync.create("1");
        assert.doesNotThrow(function() {
            first.instance.addMiddleware();
        });
    });
    it("returns early if not active", function() {
        browserSync.reset();
        var first = browserSync.create("1");
        assert.doesNotThrow(function() {
            first.instance.removeMiddleware();
        });
    });
});
