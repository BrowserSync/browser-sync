var browserSync = require("../../../../");
var testUtils = require("../../../protractor/utils");
var Immutable = require("immutable");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E proxy test with custom req headers as object", function() {
    this.timeout(15000);

    var bs, app;

    before(function(done) {
        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({ scheme: "https" }));

        app.server.listen();

        var config = {
            proxy: {
                target: "https://localhost:" + app.server.address().port,
                proxyOptions: {
                    xfwd: true
                },
                reqHeaders: {
                    "is-dev": "true"
                }
            },
            open: false,
            logLevel: "silent"
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function() {
        bs.cleanup();
        app.server.close();
    });

    it("sets custom headers on proxy reqs from an object", function(done) {
        var expected = app.html.replace("BS", bs.options.get("snippet") + "BS");
        var headers;

        app.app.stack.unshift({
            route: "/index.html",
            handle: function(req, res, next) {
                headers = req.headers;
                next();
            }
        });

        request(bs.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.equal(res.text, expected);
                assert.ok(headers["is-dev"]);
                assert.ok(headers["x-forwarded-port"]);
                assert.ok(headers["x-forwarded-proto"]);
                done();
            });
    });
});
