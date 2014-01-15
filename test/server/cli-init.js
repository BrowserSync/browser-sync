"use strict";

var index = require("../../lib/index");
var assert = require("chai").assert;
var sinon = require("sinon");
var setup = index.setup;
var defaultConfig = index.defaultConfig;

describe("Exposed INIT method for plugins", function () {
    var mergeStub;
    var kickoffStub;
    before(function () {
        mergeStub = sinon.spy(setup, "mergeConfig");
        kickoffStub = sinon.stub(setup, "kickoff");
    });
    afterEach(function () {
        mergeStub.reset();
        kickoffStub.reset();
    });
    it("should be available on the required module", function () {
        assert.isFunction(index.init);
    });
    it("should not call mergeConfig if no options provided", function () {
        index.init();
        sinon.assert.notCalled(mergeStub);
    });
    it("should call mergeConfig if options provided", function () {
        var userOptions = {
            host: "0.0.0.0"
        };
        index.init(null, userOptions);
        sinon.assert.calledWithExactly(mergeStub, defaultConfig, userOptions);
    });
    it("should call setup.kickoff with no options", function () {
        index.init(null);
        sinon.assert.calledWithExactly(kickoffStub, null, defaultConfig);
    });
    it("should call setup.kickoff with files", function () {
        index.init("*.css");
        sinon.assert.calledWithExactly(kickoffStub, "*.css", defaultConfig);
    });
    it("should call setup.kickoff with files & config", function () {
        var userOptions = {
            host: "0.0.0.0"
        };
        index.init("*.css", userOptions);
        var filesCall = kickoffStub.getCall(0).args[0];
        var optionsCall = kickoffStub.getCall(0).args[1];
        assert.equal(filesCall, "*.css");
        assert.equal(optionsCall.host, "0.0.0.0");
    });
});