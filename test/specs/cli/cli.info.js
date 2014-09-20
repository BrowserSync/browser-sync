"use strict";

var messages = require("../../../lib/messages");
var config   = require("../../../lib/config");
var info     = require("../../../lib/cli/cli-info");

var assert   = require("chai").assert;
var sinon    = require("sinon");
var chalk    = require("chalk");
var fs       = require("fs");

describe("CLI: Info Helpers:", function () {

    describe("When displaying the version number", function () {

        var consoleLogStub;
        before(function () {
            consoleLogStub = sinon.stub(console, "log");
        });
        after(function () {
            consoleLogStub.restore();
        });
        it("should be a function", function () {
            assert.isDefined(info);
        });
        it("should have a getVersion method", function () {
            assert.isDefined(info.getVersion);
        });
        it("should return the correct version number (1)", function () {
            var pjson = {
                version: "2.0"
            };
            var actual = info.getVersion(pjson);
            assert.equal(actual, "2.0");
        });
        it("should return the correct version number (2)", function () {
            var pjson = {
                version: "3.0"
            };
            var actual = info.getVersion(pjson);
            assert.equal(actual, "3.0");
        });
        it("should log the version to the console", function () {
            var pjson = {
                version: "3.0"
            };
            info.getVersion(pjson);
            sinon.assert.calledWithExactly(consoleLogStub, "3.0");
        });
    });

    describe.skip("When confirming the config file creation:", function () {
        var confirm;
        var messageStub;
        var consoleStub;
        before(function () {
            messageStub = sinon.stub(messages.config, "confirm").returns("MESSAGE");
            consoleStub = sinon.stub(console, "log");
        });
        beforeEach(function () {
            confirm = info.confirmConfig("/path");
            confirm();
        });
        afterEach(function () {
            messageStub.reset();
        });
        after(function () {
            messageStub.restore();
            consoleStub.restore();
        });
        it("should return a function", function () {
            assert.isFunction(confirm);
        });
        it("should get the correct message", function () {
            sinon.assert.calledWithExactly(messageStub, "/path");
        });
        it("should log the message to the console", function () {
            sinon.assert.calledWithExactly(consoleStub, "MESSAGE");
        });
    });

    describe("When creating the config file:", function () {

        var readStub;
        var writeStub;
        var consoleStub;

        before(function () {
            readStub    = sinon.stub(fs, "readFileSync").returns("DATA");
            writeStub   = sinon.stub(fs, "writeFile").yields(null);
            consoleStub = sinon.stub(console, "log");
        });
        afterEach(function () {
            readStub.reset();
            writeStub.reset();
            consoleStub.reset();
        });
        after(function () {
            readStub.restore();
            writeStub.restore();
            consoleStub.restore();
        });
        it("should call the readFileSync method", function () {
            info.makeConfig("/Users/shakyshane");
            sinon.assert.called(readStub);
            var args = consoleStub.getCall(0).args;
            assert.include(chalk.stripColor(args[0]), "[BS] Config file created %s");
            assert.include(chalk.stripColor(args[1]), "bs-config.js");
        });
    });
});