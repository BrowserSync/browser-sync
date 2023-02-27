var browserSync = require("../../../");
var logger = require("../../../dist/logger").logger;
var sinon = require("sinon");
var chalk       = require("chalk");

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
                sinon.assert.calledWith(
                    spy,
                    "Serving files from: %s",
                    chalk.magenta("./test")
                )
                sinon.assert.calledWith(
                    spy,
                    "Serving files from: %s",
                    chalk.magenta("./app")
                )
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
                sinon.assert.calledWith(
                    spy,
                    "Serving files from: %s",
                    chalk.magenta("./app")
                )
                sinon.assert.calledWith(
                    spy,
                    "Watching files..."
                )
                bs.cleanup(done);
            }
        );
    });
});
