var browserSync = require("../../../../");

var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E proxy test with adding and removing rewrite rules dynamically", function() {
    var bs, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        app.use(serveStatic("test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: proxytarget,
            logLevel: "silent",
            open: false,
            online: false
        };

        bs = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        bs.cleanup();
        server.close();
    });

    it("can add rules on the fly", function(done) {
        bs.addRewriteRule({
            match: "BrowserSync",
            replace: "BROWSERSYNC",
            id: "myrule"
        });

        request(bs.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "BROWSERSYNC");

                bs.removeRewriteRule("myrule");

                request(bs.server)
                    .get("/index.html")
                    .set("accept", "text/html")
                    .expect(200)
                    .end(function(err, res) {
                        assert.include(res.text, "BrowserSync");
                        assert.notInclude(res.text, "BROWSERSYNC");
                        done();
                    });
            });
    });
});
