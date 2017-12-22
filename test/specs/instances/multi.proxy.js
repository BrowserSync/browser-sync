var browserSync = require("../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E multi instance with proxy + server", function() {
    this.timeout(5000);

    var bs, bs2;

    before(function(done) {
        browserSync.reset();

        var config = {
            online: false,
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        bs = browserSync.create("server");
        bs2 = browserSync.create("proxy");

        bs.init(config, function(err, bs) {
            bs2.init(
                {
                    proxy: bs.options.getIn(["urls", "local"]),
                    open: false
                },
                done
            );
        });
    });

    after(function() {
        browserSync.get("server").cleanup();
        browserSync.get("proxy").cleanup();
    });

    it("can serve from built in server & when proxied (inception)", function(done) {
        var instance1 = browserSync.get("server");
        var instance2 = browserSync.get("proxy");

        request(instance1.instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance1.getOption("snippet"));
            });

        request(instance2.instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance2.getOption("snippet"));
                done();
            });
    });
});
