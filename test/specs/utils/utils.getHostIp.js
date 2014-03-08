"use strict";

var utils    = require("../../../lib/utils").utils;
var messages = require("../../../lib/messages");

var devIp    = require("dev-ip");

var assert   = require("chai").assert;
var sinon    = require("sinon");

describe("getting the Host IP", function () {

    var regex;
    var stub, ipStub;
    before(function () {
        stub = sinon.stub(messages.host, "multiple");
        ipStub = sinon.stub(devIp, "getIp").returns("192.168.0.4");
    });
    beforeEach(function () {
        regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    });
    afterEach(function () {
        ipStub.reset();
    });
    after(function () {
        stub.restore();
        ipStub.restore();
    });

    it("does not throw if no are options provided", function () {
        assert.doesNotThrow(function () {
            utils.getHostIp({});
        });
    });
    it("should use the IP address if provided in the options", function () {
        var hostIp = utils.getHostIp({
            host: "192.0.0.1"
        });
        assert.equal(hostIp, "192.0.0.1");
    });
    it("should use 0.0.0.0 as a fallback when detect:false", function () {
        var hostIp = utils.getHostIp({
            detect: false
        });
        assert.equal(hostIp, "0.0.0.0");
    });
    it("should use 0.0.0.0 as a fallback when no network available", function () {
        ipStub.returns(false);
        var hostIp = utils.getHostIp({});
        assert.equal(hostIp, "0.0.0.0");
    });
    it("should return the ip if given as string", function () {
        var host = "127.0.0.2";
        var actual = utils.getHostIp({host: host});
        assert.equal(actual, host);
    });
    it("should return the first ip if given array", function () {
        var stubs = ["127.0.0.2", "21.23.4.6"];
        ipStub.returns(stubs);

        var actual = utils.getHostIp({});
        assert.equal(actual, stubs[0]);
    });
});