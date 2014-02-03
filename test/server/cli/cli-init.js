"use strict";

var index = require("../../../lib/index");
var assert = require("chai").assert;
var sinon = require("sinon");
var setup = index.setup;
var defaultConfig = index.defaultConfig;

describe("Exposed INIT method for plugins", function () {
    var mergeConfigSpy;
    var mergeFilesSpy;
    var kickoffStub;
    before(function () {
        mergeConfigSpy = sinon.spy(setup, "mergeConfigObjects");
        mergeFilesSpy = sinon.spy(setup, "mergeFiles");
        kickoffStub = sinon.stub(setup, "kickoff");
    });
    afterEach(function () {
        mergeFilesSpy.reset();
        mergeConfigSpy.reset();
        kickoffStub.reset();
    });
    it("should be available on the required module", function () {
        assert.isFunction(index.init);
    });
    it("should not call mergeConfigObjects if no options provided", function () {
        index.init();
        sinon.assert.notCalled(mergeConfigSpy);
    });
    it("should call mergeConfigObjects if options provided", function () {
        var userOptions = {
            host: "0.0.0.0"
        };
        index.init(null, userOptions);
        sinon.assert.calledWithExactly(mergeConfigSpy, defaultConfig, userOptions);
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
    it("should call merge files if files option & exclude option exists", function () {
        var files = "*.css";
        var userOptions = {
            exclude: "node_modules"
        };
        index.init("*.css", userOptions);
        sinon.assert.calledWithExactly(mergeFilesSpy, "*.css", "node_modules");
    });
    it("should call kickoff with merged files", function () {
        var files = "*.css";
        var userOptions = {
            exclude: "node_modules"
        };
        index.init("*.css", userOptions);
        var kickoffCall = kickoffStub.getCall(0).args[0];
        var expected = ["*.css", "!node_modules/**"];
        assert.deepEqual(kickoffCall, expected);
    });
    it("should NOT call merge files if files provides, but no exclude", function () {
        var files = "*.css";
        var userOptions = {};
        index.init("*.css", userOptions);
        sinon.assert.notCalled(mergeFilesSpy);
    });
});