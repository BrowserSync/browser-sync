var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var assert = require("chai").assert;
var sinon = require("sinon");
var _ = require("lodash");

var browserSync = new bs();
var options = bs.options;

describe("Failing the process on errors", function () {

    var spy;
    before(function () {
        spy = sinon.spy(browserSync, "log");
    });
    afterEach(function () {
        spy.reset();
    });
    after(function () {
        spy.restore();
    });
    it("has the fail method", function(){
        assert.isDefined(browserSync.fail);
    });
    it("can fail", function () {
        browserSync.fail("Error!", {}, false);
        sinon.assert.calledWith(spy, "Error!", {}, true);
    });
});

