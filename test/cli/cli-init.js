"use strict";

var index = require("../../lib/index");
var version = require("../../package.json").version;
var assert = require("chai").assert;
var sinon = require("sinon");
var events = require("events");
var cliUtils = require("../../lib/cli").utils;
var defaultConfig = require("../../lib/default-config");

describe("Exposed INIT method for plugins", function () {
    var mergeConfigSpy;
    var mergeFilesSpy;
    var startStub;
    before(function () {
        mergeConfigSpy = sinon.spy(cliUtils, "mergeConfigObjects");
        mergeFilesSpy = sinon.spy(cliUtils, "mergeFiles");
        startStub = sinon.stub(cliUtils, "_start").returns(new events.EventEmitter());
    });
    afterEach(function () {
        mergeFilesSpy.reset();
        mergeConfigSpy.reset();
        startStub.reset();
    });
    after(function () {
        startStub.restore();
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
        sinon.assert.calledWithExactly(startStub, null, defaultConfig, version);
    });
    it("should call setup.kickoff with files", function () {
        index.init("*.css");
        sinon.assert.calledWithExactly(startStub, "*.css", defaultConfig, version);
    });
    it("should call setup.kickoff with files & config", function () {
        var userOptions = {
            host: "0.0.0.0"
        };
        index.init("*.css", userOptions);
        var filesCall = startStub.getCall(0).args[0];
        var optionsCall = startStub.getCall(0).args[1];
        assert.equal(filesCall, "*.css");
        assert.equal(optionsCall.host, "0.0.0.0");
    });
    it("should call merge files if files option & exclude option exists", function () {
        var userOptions = {
            exclude: "node_modules"
        };
        index.init("*.css", userOptions);
        sinon.assert.calledWithExactly(mergeFilesSpy, "*.css", "node_modules");
    });
    it("should call kickoff with merged files", function () {
        var userOptions = {
            exclude: "node_modules"
        };
        index.init("*.css", userOptions);
        var args = startStub.getCall(0).args[0];
        var expected = ["*.css", "!node_modules/**"];
        assert.deepEqual(args, expected);
    });
    it("should NOT call merge files if files provides, but no exclude", function () {
        var userOptions = {};
        index.init("*.css", userOptions);
        sinon.assert.notCalled(mergeFilesSpy);
    });
    it("should return the eventEmitter", function () {
        var userOptions = {};
        var actual = index.init("*.css", userOptions);
        assert.instanceOf(actual, events.EventEmitter);
    });
});