var browserSync = require("../../../");
var utils = require("../../../dist/utils");
var assert = require("chai").assert;
var sinon = require("sinon");

describe("Plugins: Retrieving user plugins when given inline, but with error", function() {
    it("Should fail if a plugin error occurred", function(done) {
        browserSync.reset();
        sinon.stub(utils, "fail", function(kill, errMessage) {
            assert.instanceOf(errMessage, Error);
            assert.equal(
                errMessage.message,
                "Plugin not supported in this format"
            );
            utils.fail.restore();
        });

        browserSync(
            {
                plugins: {
                    module: {
                        plugin: function() {}
                    }
                },
                open: false,
                logLevel: "silent"
            },
            function(err, bs) {
                bs.cleanup();
                done();
            }
        );
    });
    it("Should fail if a plugin is missing both module & plugin properties", function(done) {
        browserSync.reset();
        sinon.stub(utils, "fail", function(kill, errMessage) {
            assert.instanceOf(errMessage, Error);
            assert.equal(
                errMessage.message,
                "Plugin was not configured correctly"
            );
            utils.fail.restore();
        });

        browserSync(
            {
                plugins: [
                    {
                        name: "shane"
                    }
                ],
                open: false,
                logLevel: "silent"
            },
            function(err, bs) {
                bs.cleanup();
                done();
            }
        );
    });
});
