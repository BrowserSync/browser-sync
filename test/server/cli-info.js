"use strict";

var index = require("../../lib/index");
var _ = require("lodash");
var assert = require("chai").assert;
var sinon = require("sinon");
var fs = require("fs");
var messages = require("../../lib/messages");
var setup = index.setup;
var info = index.info;

describe("displaying the version number", function () {

    var spy;
    before(function () {
        spy = sinon.spy(console, "log");
    });
    after(function () {
        spy.restore();
    });
    it("should be defined", function(){
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
        sinon.assert.calledWithExactly(spy, "3.0");
    });
});

describe("confirm Config", function () {
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
    it("should return a function", function(){
        assert.isFunction(confirm);
    });
    it("should get the correct message", function(){
        sinon.assert.calledWithExactly(messageStub, "/path");
    });
    it("should log the message to the console", function(){
        sinon.assert.calledWithExactly(consoleStub, "MESSAGE");
    });
});

describe("creating the config file", function () {
    var readStub;
    var writeStub;
    var actual;
    var cwd;
    var confirmStub;
    var confirmSpy;
    before(function () {

        var writeMock = function (var1, var2, cb) {
            cb();
        };

        readStub    = sinon.stub(fs, "readFileSync").returns("DATA");
        writeStub   = sinon.stub(fs, "writeFile", writeMock);
        cwd         = sinon.stub(process, "cwd").returns("/users/app");
        confirmSpy  = sinon.spy();
        confirmStub = sinon.stub(info, "confirmConfig").returns(confirmSpy);
    });
    beforeEach(function () {
        actual = info.makeConfig();
    });
    afterEach(function () {
        readStub.reset();
        writeStub.reset();
        confirmStub.reset();
        cwd.reset();
        confirmSpy.reset();
    });
    after(function () {
        readStub.restore();
        writeStub.restore();
        cwd.restore();
    });
    it("should create the config file", function () {
        sinon.assert.called(readStub);
    });
    it("should create the config file", function () {
        var expectedPath = "/users/app" + messages.configFile;
        sinon.assert.calledWithExactly(writeStub, expectedPath, "DATA", confirmSpy);
    });
    it("should call confirm config with the Path to the file", function(){
        sinon.assert.called(confirmSpy);
    });
});
