"use strict";

var loadedConfig = require("../../../lib/default-config");
var info         = require("../../../lib/cli/cli-info");
var init         = require("../../../lib/cli/cli-init");

var _            = require("lodash");
var sinon        = require("sinon");

describe("CLI: Resolving Config Files:", function () {

    var defaultConfig;

    beforeEach(function(){
        defaultConfig = _.cloneDeep(loadedConfig);
    });

    describe("When the config option", function () {
        var getDefaultFileStub;
        var cbSpy;
        var getFileStub;
        before(function () {
            getFileStub        = sinon.stub(info, "_getConfigFile").returns({});
            cbSpy = sinon.spy();
        });
        afterEach(function () {
            getFileStub.reset();
        });
        after(function () {
            cbSpy.reset();
            getFileStub.restore();
        });
        describe("is NOT given on command line", function () {
            var args = {};
            beforeEach(function () {
                init.startFromCommandLine(args, cbSpy);
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
            it("should call '_getConfigFile' with the path given", function(){
                sinon.assert.calledWithExactly(getFileStub, args.config);
            });
            it("should call the callback", function () {
                sinon.assert.called(cbSpy);
            });
        });
    });
});
