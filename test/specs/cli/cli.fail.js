"use strict";

var utils    = require("../../../lib/utils").utils;
var messages = require("../../../lib/messages");
var assert   = require("chai").assert;
var sinon    = require("sinon");

describe("Failing the process on errors", function () {

    var spy;
    before(function () {
        spy = sinon.spy(utils, "log");
    });
    afterEach(function () {
        spy.reset();
    });
    after(function () {
        spy.restore();
    });
    it("has the fail method", function(){
        assert.isDefined(utils.fail);
    });
    it("can fail", function () {
        utils.fail("Error!", {}, false);
        sinon.assert.calledWithExactly(spy, "Error!", {}, false);
    });
});

