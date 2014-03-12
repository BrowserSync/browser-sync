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

describe("Resolving Config:", function () {

    var defaultConfig;

    beforeEach(function(){
        defaultConfig = _.cloneDeep(loadedConfig);
    });

    describe("When config option is NOT given on command line", function () {
        var getDefaultFileStub;
        var cbSpy;
        before(function () {
            getDefaultFileStub = sinon.stub(info, "getDefaultConfigFile").returns({});
            cbSpy = sinon.spy();
        });
        afterEach(function () {
            getDefaultFileStub.reset();
        });
        after(function () {
            getDefaultFileStub.restore();
            cbSpy.reset();
        });
        it("should attempt to retrieve the default config file path", function () {
            var args = {};
            init.startFromCommandLine(args, cbSpy);
            sinon.assert.called(getDefaultFileStub);
            sinon.assert.called(cbSpy);
        });
        it("should attempt to retrieve the config file if given on command line", function () {
            var args = {config: "config/bs-config.js"};
            init.startFromCommandLine(args, cbSpy);
            sinon.assert.notCalled(getDefaultFileStub);
        });
    });
});
