"use strict";

var index = require("../../lib/index");
var dConfig = require("../fixtures/si-default-config");
var _ = require("lodash");
var assert = require("chai").assert;
var sinon = require("sinon");
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
        sinon.assert.calledWith(spy, "3.0");
    });
});

