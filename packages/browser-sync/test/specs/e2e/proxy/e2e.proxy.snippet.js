var browserSync = require("../../../../");

var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E proxy test with snippet options: Whitelist", function() {
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
            open: false,
            snippetOptions: {
                whitelist: ["/index-large.html"]
            }
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

    it("can init proxy & serve a page with whitelist option (injects snippet even without html headers)", function(done) {
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/index-large.html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, options.get("snippet"));
                done();
            });
    });
});

describe("E2E proxy test with snippet options: blacklist", function() {
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
            open: false,
            snippetOptions: {
                blacklist: ["/index-large.html"]
            }
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

    it("can init proxy & serve a page with whitelist option", function(done) {
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.notInclude(res.text, options.get("snippet"));
                done();
            });
    });
});
