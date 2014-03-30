"use strict";

var defaultConfig = require("../../../lib/default-config");
var cli           = require("../../../lib/cli");
var program       = require("commander");
var init          = cli.init;
var options       = cli.options;

var assert        = require("chai").assert;
var sinon         = require("sinon");

var allowed = Object.keys(defaultConfig);

describe("Parsing Command-line usage", function () {

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

    it("should call the callback when init command given", function() {
        var argv = [
            "",
            "",
            "init",
            "--server",
            "--directory"
        ];
        init.parse("0.0.0", { _: []}, argv, cbSpy);
        sinon.assert.called(cbSpy);
    });
    it("should show the help if no commands given", function() {
        init.parse("0.0.0", { _: []}, ["", ""], cbSpy);
        sinon.assert.calledOnce(helpStub);
    });

    it("should call startFromCommandLine() when start command given", function () {
        var argv = [
            "",
            "",
            "start"
        ];
        init.parse("0.0.0", { _: []}, argv, cbSpy);
        sinon.assert.called(startStub);
    });
});
