var browserSync = require("../../../../");

var assert = require("chai").assert;

describe.skip("Tunnel e2e tests", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false,
            tunnel: true,
            online: true
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("should call init on the tunnel", function() {
        assert.include(
            instance.options.getIn(["urls", "tunnel"]),
            "localtunnel.me"
        );
    });
});

describe.skip("Tunnel e2e tests with subdomain", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false,
            tunnel: String(Math.floor(Math.random() * 2e10)),
            online: true
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("should call init on the tunnel", function() {
        assert.include(
            instance.options.getIn(["urls", "tunnel"]),
            "localtunnel.me"
        );
    });
});

describe("Tunnel e2e tests with Error", function() {
    it.skip("does not blow up if tunnel unavailable", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false,
            tunnel: true,
            online: true
        };

        var tunnelPath = require.resolve("localtunnel");

        require("localtunnel");

        require("sinon")
            .stub(require.cache[tunnelPath], "exports")
            .yields(new Error("Some error from localtunnel.me"));

        browserSync(config, function(err, bs) {
            assert.isUndefined(bs.options.getIn(["urls", "tunnel"]));
            delete require.cache[tunnelPath];
            bs.cleanup();
            done();
        });
    });

    it.skip("does not crash if tunnel restarts", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            tunnel: true,
            online: true
        };

        browserSync(config, function(err, bs) {
            bs.tunnel.emit(
                "error",
                new Error("connection refused: (check your firewall settings)")
            );
            bs.cleanup();
            done();
        });
    });
});
