require("source-map-support").install();

var path = require("path");

var pkg = require(path.resolve("package.json"));
var sinon = require("sinon");
var logger = require("../../../dist/logger").logger;
var assert = require("chai").assert;
var cli = require(path.resolve(pkg.bin)).default;
var fs = require("fs");
var rim = require("rimraf").sync;

describe("E2E CLI `recipes` command", function() {
    it("works with no output flag", function(done) {
        rim("./server");
        cli({
            cli: {
                input: ["recipe", "server"],
                flags: {}
            },
            cb: function() {
                assert.isTrue(fs.existsSync("./server"));
                rim("./server");
                done();
            }
        });
    });
    it("lists all available when no second arg given", function(done) {
        var stub1 = sinon.stub(logger, "info");
        var stub2 = sinon.stub(console, "log");

        cli({
            cli: {
                input: ["recipe"],
                flags: {}
            },
            cb: function() {
                sinon.assert.calledWith(stub1, "No recipe name provided!");
                sinon.assert.calledWith(
                    stub1,
                    "Install one of the following with {cyan:browser-sync recipe <name>\n"
                );

                logger.info.restore();
                console.log.restore();

                var calls = stub2.getCalls().map(function(call) {
                    return call.args[0].trim();
                });

                assert.include(calls, "gulp.pug");
                assert.include(calls, "server");
                assert.include(calls, "html.injection");
                done();
            }
        });
    });
    it("Does not overwrite existing dir", function(done) {
        cli({
            cli: {
                input: ["recipe", "server"],
                flags: {
                    output: "test/fixtures"
                }
            },
            cb: function(err) {
                assert.equal(
                    err.message,
                    "Target folder exists remove it first and then try again"
                );
                done();
            }
        });
    });
    it("accepts --output flag", function(done) {
        var stub1 = sinon.stub(logger, "info");
        cli({
            cli: {
                input: ["recipe", "server"],
                flags: {
                    output: "test/recipes/server1"
                }
            },
            cb: function() {
                var dir = path.resolve("./test/recipes/server1");
                assert.isTrue(fs.existsSync("test/recipes/server1"));
                rim("test/recipes/server1");
                var call1 = stub1.getCall(0).args;
                assert.equal(call1[0], "Recipe copied into {cyan:%s}");
                assert.equal(call1[1], dir);
                sinon.assert.calledWith(
                    stub1,
                    "Next, inside that folder, run {cyan:npm i && npm start}"
                );
                logger.info.restore();
                done();
            }
        });
    });
    it("Loges recipes when not found", function(done) {
        var stub1 = sinon.stub(logger, "info");
        var stub2 = sinon.stub(console, "log");

        cli({
            cli: {
                input: ["recipe", "beepboop"],
                flags: {}
            },
            cb: function(err) {
                var call1 = stub1.getCall(0).args;
                assert.equal(
                    call1[0],
                    "Recipe {cyan:%s} not found. The following are available though"
                );

                var calls = stub2.getCalls().map(function(call) {
                    return call.args[0].trim();
                });

                assert.include(calls, "gulp.pug");
                assert.include(calls, "server");
                assert.include(calls, "html.injection");

                logger.info.restore();
                console.log.restore();

                done();
            }
        });
    });
});
