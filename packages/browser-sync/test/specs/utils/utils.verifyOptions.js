var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;
var sinon = require("sinon");
var assert = require("chai").assert;

describe("Utils: getting config errors", function() {
    it("return a message if both server + proxy given", function() {
        var actual = utils.getConfigErrors(merge({ server: true, proxy: "http://bbc.co.uk" })[0]);
        assert.equal(actual.length, 1);
    });
    it("returns empty array if no errors", function() {
        var actual = utils.getConfigErrors(merge({ server: true })[0]);
        assert.equal(actual.length, 0);
    });
});

describe.skip("Utils: verifying user-provided config", function() {
    var stub;
    before(function() {
        stub = sinon.stub(utils, "fail");
    });
    afterEach(function() {
        stub.reset();
    });
    after(function() {
        utils.fail.restore();
    });
    it("ends process if config incorrect", function() {
        var fn = function() {};
        utils.verifyConfig(merge({ server: true, proxy: "http://bbc.co.uk" })[0], fn);
        sinon.assert.calledWithExactly(
            stub,
            true,
            "Invalid config. You cannot specify both server & proxy options.",
            fn
        );
    });
    it("does not end process if no errors found with config", function() {
        var fn = function() {};
        utils.verifyConfig(merge({ server: true })[0], fn);
        sinon.assert.notCalled(stub);
    });
});
