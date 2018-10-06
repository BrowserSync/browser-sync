var utils = require("../../../dist/utils");
var assert = require("chai").assert;

describe("Utils: default callback", function() {
    it("should log errors if no callback given", function() {
        var stub = require("sinon").stub(console, "error");
        utils.defaultCallback(new Error("some error"));
        require("sinon").assert.called(stub);
        assert.equal(stub.getCall(0).args[0], "some error");
        console.error.restore();
    });
});
