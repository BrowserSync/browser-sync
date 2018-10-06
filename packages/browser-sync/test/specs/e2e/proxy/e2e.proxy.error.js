var browserSync = require("../../../../");
var testUtils = require("../../../protractor/utils");
var Immutable = require("immutable");
var assert = require("chai").assert;

describe.skip("E2E proxy test with custom proxy error handler", function() {
    this.timeout(15000);

    var bs, app;

    before(function(done) {
        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({ scheme: "https" }));

        app.server.listen();

        var config = {
            proxy: {
                target: "http://iuiu:4444"
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

    it("logs proxy errors with debug logger", function(done) {
        var obj = {
            hostname: "localhost",
            port: bs.options.get("port"),
            path: "/"
        };

        var spy = require("sinon").spy(bs.logger, "debug");

        var req = require("http").request(obj, function() {
            /* noop */
        });
        req.on("error", function(err) {
            var int = setInterval(function() {
                if (spy.getCall(0)) {
                    clearInterval(int);
                    assert.equal(spy.getCall(0).args[1], err.message);
                    done();
                }
            }, 100);
        });
        req.write("sup");
        req.end();
    });
});
