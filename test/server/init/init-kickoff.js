var Bs = require("../../../lib/browser-sync");
var bsInst = new Bs();
var index = require("../../../lib/index");
var events = require("events");
var assert = require("chai").assert;
var sinon = require("sinon");
var options = index.defaultConfig;

describe("Browser Sync INIT", function () {

    var bsStub;
    before(function () {
        bsStub = sinon.stub(bsInst, "init").returns(new events.EventEmitter());
    });

    describe("returning event emitter", function () {
        it("should return the event emitter", function () {
            var actual = index.init([], options);
            assert.instanceOf(actual, events.EventEmitter);
        });
    });
});