var browserSync = require("../../../");
var request = require("supertest");
var Immutable = require("immutable");
var assert = require("chai").assert;

describe("Plugins: User interface", function() {
    it("Should start the UI", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        browserSync(config, function(err, bs) {
            request(bs.ui.server)
                .get("/")
                .expect(200)
                .end(function() {
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: User interface", function() {
    it("Should ignore the UI if false given in options", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false,
            ui: false
        };

        browserSync(config, function(err, bs) {
            assert.isUndefined(bs.ui);
            assert.isFalse(bs.options.get("ui"));
            bs.cleanup();
            done();
        });
    });
});

describe("Plugins: User interface - providing an override", function() {
    it("Should use the user-provided plugin", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        browserSync.use(
            {
                "plugin:name": "UI",
                plugin: function(opts, bs, cb) {
                    opts = Immutable.fromJS(opts).mergeDeep(
                        Immutable.fromJS({
                            urls: {
                                ui: "http://localhost:3001"
                            }
                        })
                    );
                    cb(null, {
                        options: opts
                    });
                }
            },
            { port: 3333 }
        );

        browserSync(config, function(err, bs) {
            assert.deepEqual(bs.ui.options.get("port"), 3333);
            bs.cleanup();
            done();
        });
    });
});
