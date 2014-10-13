"use strict";

var init    = require("../../../lib/cli/cli-init");
var program = require("commander");

var sinon   = require("sinon");
var assert  = require("chai").assert;

describe("CLI: Options: Parsing Command-line usage: ", function () {

    var startStub;

    var cbSpy;
    var helpStub;
    before(function () {
        startStub = sinon.stub(init, "startFromCommandLine");
        helpStub  = sinon.stub(program, "help");
        cbSpy     = sinon.spy();
    });
    afterEach(function () {
        startStub.reset();
        helpStub.reset();
        cbSpy.reset();
    });
    after(function () {
        startStub.restore();
        helpStub.restore();
    });

    it.skip("should call the callback when `init` command given", function () {
        var argv = [
            "",
            "",
            "init"
        ];
        init.parse("0.0.0", {_: []}, argv, cbSpy);
        sinon.assert.called(cbSpy);
    });

    it("should call startFromCommandLine() when `start` command given", function () {
        var argv = [
            "",
            "",
            "start"
        ];
        init.parse("0.0.0", {_: []}, argv, cbSpy);
        sinon.assert.called(startStub);
    });

    it("should show the help if no commands given", function () {
        init.parse("0.0.0", {_: []}, ["", ""], cbSpy);
        sinon.assert.calledOnce(helpStub);
    });

    it("show the help screen", function () {
        assert.doesNotThrow(function () {
            init.help();
        });
    });
});
