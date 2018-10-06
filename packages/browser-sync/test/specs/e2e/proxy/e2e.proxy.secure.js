var browserSync = require("../../../../");
var testUtils = require("../../../protractor/utils");
var Immutable = require("immutable");
var request = require("supertest");
var assert = require("chai").assert;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe("E2E TLS proxy test", function() {
    this.timeout(15000);

    it("Set's a HTTPS url", function(done) {
        browserSync.reset();

        var app = testUtils.getApp(Immutable.Map({ scheme: "https" }));

        app.server.listen();

        var config = {
            proxy: "https://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent"
        };

        browserSync.init(config, function(err, bs) {
            bs.cleanup();
            app.server.close();

            var local = bs.options.getIn(["urls", "local"]);
            assert.equal("https://localhost:" + bs.options.get("port"), local);

            done();
        });
    });

    it("Set's a HTTPS url with none-https proxy target", function(done) {
        browserSync.reset();

        var app = testUtils.getApp(Immutable.Map({ scheme: "http" }));

        app.server.listen();

        var config = {
            proxy: "http://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent",
            https: true
        };

        browserSync.init(config, function(err, bs) {
            if (err) {
                throw err;
            }

            var local = bs.options.getIn(["urls", "local"]);
            var expected = app.html.replace(
                "BS",
                bs.options.get("snippet") + "BS"
            );

            assert.equal("https://localhost:" + bs.options.get("port"), local);

            request(bs.options.getIn(["urls", "local"]))
                .get("/index.html")
                .set("accept", "text/html")
                .expect(200, function(err, res) {
                    assert.equal(res.text, expected);
                    bs.cleanup();
                    app.server.close();
                    done();
                });
        });
    });

    it("proxies over https and injects snippet", function(done) {
        browserSync.reset();

        var app = testUtils.getApp(Immutable.Map({ scheme: "https" }));

        app.server.listen();

        var config = {
            proxy: "https://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent"
        };

        browserSync.init(config, function(err, bs) {
            assert.isString(bs.options.get("snippet"));

            var expected = app.html.replace(
                "BS",
                bs.options.get("snippet") + "BS"
            );

            request(bs.options.getIn(["urls", "local"]))
                .get("/index.html")
                .set("accept", "text/html")
                .expect(200, expected, function() {
                    bs.cleanup();
                    app.server.close();
                    done();
                });
        });
    });
});
