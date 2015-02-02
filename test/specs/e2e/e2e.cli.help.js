"use strict";

var assert  = require("chai").assert;
var path    = require("path");
var sinon   = require("sinon");

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI help test", function () {

    it("displays help text", function (done) {

        var spy  = sinon.spy(console, "log");
        var help = cli.getHelpText(path.resolve("./lib/cli/help.txt"));

        cli({
            cli: {
                help: help,
                input: [],
                flags: {}
            }
        });

        var args = spy.getCall(0).args;
        sinon.assert.called(spy);
        assert.include(args[0], help);
        console.log.restore();
        done();
    });
});
