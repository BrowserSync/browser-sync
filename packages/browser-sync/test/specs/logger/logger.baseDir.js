var browserSync = require("../../../");
var logger = require("../../../dist/logger").logger;
var sinon = require("sinon");
var assert = require("chai").assert;

function hasCleanArgs(stub, args) {
    return hasArgs(cleanArgs(stub.getCalls()), args);
}

function cleanArgs(calls) {
    return calls.map(function(call) {
        call.args = call.args.map(require("chalk").stripColor);
        return call;
    });
}

function hasArgs(calls, args) {
    return calls.some(function(clean) {
        var successes = 0;
        args.forEach(function(arg, i) {
            if (clean.args[i] === arg) {
                successes += 1;
            }
        });
        return successes === args.length;
    });
}

describe("Logging", function() {
    var spy;
    before(function() {
        spy = sinon.stub(logger, "info");
        browserSync.reset();
    });
    afterEach(function() {
        spy.reset();
    });
    after(function() {
        logger.info.restore();
    });
    it("should log multiple base directories", function(done) {
        browserSync(
            {
                server: ["./test", "./app"],
                open: false
            },
            function(err, bs) {
                assert.isTrue(
                    hasCleanArgs(spy, [
                        "Serving files from: {magenta:%s}",
                        "./test"
                    ])
                );
                assert.isTrue(
                    hasCleanArgs(spy, [
                        "Serving files from: {magenta:%s}",
                        "./app"
                    ])
                );
                bs.cleanup(done);
            }
        );
    });
});

describe("Logging", function() {
    var spy;
    before(function() {
        spy = sinon.stub(logger, "info");
        browserSync.reset();
    });
    afterEach(function() {
        spy.reset();
    });
    after(function() {
        logger.info.restore();
    });
    it("should log single base directories", function(done) {
        browserSync(
            {
                server: "./app",
                files: "*.html",
                open: false
            },
            function(err, bs) {
                assert.isTrue(
                    hasCleanArgs(spy, [
                        "Serving files from: {magenta:%s}",
                        "./app"
                    ])
                );
                assert.isTrue(hasCleanArgs(spy, ["Watching files..."]));
                bs.cleanup(done);
            }
        );
    });
});
