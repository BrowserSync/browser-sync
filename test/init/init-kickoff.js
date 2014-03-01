var index = require("../../lib/index");
var events = require("events");
var assert = require("chai").assert;
var sinon = require("sinon");
var cliUtils = require("../../lib/cli").utils;

describe("Browser Sync INIT", function () {

    var bsStub;
    before(function () {
        bsStub = sinon.stub(cliUtils, "_start").returns(new events.EventEmitter());
    });

    describe("returning event emitter", function () {
        it("should return the event emitter", function () {
            var actual = index.init([], {});
            assert.instanceOf(actual, events.EventEmitter);
        });
    });
});