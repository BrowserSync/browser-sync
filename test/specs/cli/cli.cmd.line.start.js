"use strict";

var index        = require("../../../lib/index");
var messages     = require("../../../lib/messages");
var config       = require("../../../lib/config");
var loadedConfig = require("../../../lib/default-config");
var info         = require("../../../lib/cli-info");
var init         = require("../../../lib/cli-init");

var _            = require("lodash");
var sinon        = require("sinon");
var assert       = require("chai").assert;

describe("Resolving Config Files:", function () {

    var defaultConfig;

    beforeEach(function(){
        defaultConfig = _.cloneDeep(loadedConfig);
    });

    describe("When the config option", function () {
        var getDefaultFileStub;
        var cbSpy;
        var getFileStub;
        before(function () {
            getDefaultFileStub = sinon.stub(info, "getDefaultConfigFile").returns({});
            getFileStub        = sinon.stub(info, "_getConfigFile").returns({});
            cbSpy = sinon.spy();
        });
        afterEach(function () {
            getDefaultFileStub.reset();
            getFileStub.reset();
        });
        after(function () {
            getDefaultFileStub.restore();
            cbSpy.reset();
            getFileStub.restore();
        });
        describe("is NOT given on command line", function () {
            var args = {};
            beforeEach(function () {
                init.startFromCommandLine(args, cbSpy);
            });
            it("should attempt to retrieve the DEFAULT config file path", function () {
                sinon.assert.called(getDefaultFileStub);
            });
            it("should call the callback with the results", function () {
                sinon.assert.called(cbSpy);
            });
        });
        describe("is given on the command line", function () {
            var args;
            beforeEach(function () {
                args = {config: "config/bs-config.js"};
                init.startFromCommandLine(args, cbSpy);
            });
            it("should attempt to retrieve the config file", function () {
                sinon.assert.notCalled(getDefaultFileStub);
            });
            it("should call '_getConfigFile' with the path given", function(){
                sinon.assert.calledWithExactly(getFileStub, args.config);
            });
            it("should call the callback", function () {
                sinon.assert.called(cbSpy);
            });
        });
    });
});
