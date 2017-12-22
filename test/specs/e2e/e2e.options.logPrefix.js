var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var stripColor = require("chalk").stripColor;
var logger = require("../../../dist/logger").logger;

describe("E2E `logPrefix` option", function() {
    it("Can set the log prefix when given in options", function(done) {
        browserSync.reset();
        var config = {
            open: false,
            logPrefix: "BS2",
            logLevel: "info",
            ui: false
        };
        logger.mute(false);
        var spy = sinon.spy(console, "log");
        browserSync(config, function(err, bs) {
            console.log(err);
            var arg = spy.getCall(0).args[0];
            assert.include(stripColor(arg), "[BS2]");
            assert.notInclude(stripColor(arg), "[BS]");
            console.log.restore();
            bs.cleanup();
            done();
        });
    });

    it("Can set the log prefix with a function when given in options", function(done) {
        browserSync.reset();
        var config = {
            open: false,
            logPrefix: function() {
                return this.compile("AWESOME");
            },
            logLevel: "info",
            online: false,
            ui: false
        };
        logger.mute(false);
        var spy = sinon.spy(console, "log");
        browserSync(config, function(err, bs) {
            var arg = spy.getCall(0).args[0];
            assert.include(stripColor(arg), "AWESOME");
            assert.notInclude(stripColor(arg), "[BS]");
            console.log.restore();
            bs.cleanup();
            done();
        });
    });
});
