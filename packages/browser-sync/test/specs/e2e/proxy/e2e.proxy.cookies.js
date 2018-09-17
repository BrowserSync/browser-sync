var browserSync = require("../../../../");
var testUtils = require("../../../protractor/utils");
var Immutable = require("immutable");
var request = require("supertest");

describe.skip("E2E proxy test with custom cookies options passed to foxy", function() {
    this.timeout(15000);

    var bs, app;

    before(function(done) {
        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({ scheme: "https" }));

        app.server.listen();

        var config = {
            proxy: {
                target: "https://localhost:" + app.server.address().port,
                cookies: {
                    stripDomain: false
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

    it("sets cookie stripDomain: false", function(done) {
        var expected = app.html.replace("BS", bs.options.get("snippet") + "BS");

        request(bs.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200, expected, done);
    });
});
