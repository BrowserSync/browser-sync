var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Plugins: Setting the default state (false) if given in options", function() {
    it("Should auto disable a plugin when options given (1)", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: "bs-snippet-injector",
                    options: {
                        enabled: false,
                        file: ""
                    }
                }
            ]
        };

        browserSync(config, function(err, bs) {
            assert.equal(bs.getUserPlugins().length, 1);
            assert.isFalse(bs.getUserPlugins()[0].active);
            bs.cleanup();
            done();
        });
    });
});

describe("Plugins: Setting the default state (true) if given in options", function() {
    it("Should auto disable a plugin when options given (2)", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: "bs-snippet-injector",
                    options: {
                        enabled: true
                    }
                }
            ]
        };

        browserSync(config, function(err, bs) {
            assert.equal(bs.getUserPlugins().length, 1);
            assert.isTrue(bs.getUserPlugins()[0].active);
            bs.cleanup();
            done();
        });
    });
});
