var utils = require("../../../dist/utils");
var assert = require("chai").assert;

describe("Utils: Failing", function() {
    it("should fail when Error obj given", function() {
        require("sinon").stub(process, "exit");
        utils.fail(true, new Error("Some err bro"), function(out) {
            assert.instanceOf(out, Error);
        });
        process.exit.restore();
    });
    it("should fail with Error obj when string given", function() {
        require("sinon").stub(process, "exit");
        utils.fail(true, "Some err bro", function(out) {
            assert.instanceOf(out, Error);
        });
        process.exit.restore();
    });
});
