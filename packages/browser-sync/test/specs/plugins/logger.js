var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var stripAnsi = require("strip-ansi");

describe("Plugins: Getting a logger", function() {
    var stub;
    before(function() {
        stub = sinon.spy(console, "log");
    });
    after(function() {
        console.log.restore();
    });
    it("Can use a plugin-specific logger", function(done) {
        browserSync.reset();

        var instance;
        var PLUGIN_NAME = "HTML";

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use(
            {
                "plugin:name": PLUGIN_NAME,
                plugin: function(opts, bs) {
                    var logger = bs.getLogger(PLUGIN_NAME);
                    logger
                        .setLevel("info")
                        .setLevelPrefixes(false)
                        .info("Connected!");
                        var msg = stripAnsi(stub.getCall(0).args[0]);
                    assert.equal(msg, "[Browsersync] [HTML] Connected!");
                    instance.cleanup();
                    done();
                }
            },
            { name: "shane" }
        );

        instance = browserSync(config).instance;
    });
});
