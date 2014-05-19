"use strict";

var utils    = require("../../../lib/utils").utils;

var assert   = require("chai").assert;
var sinon    = require("sinon");

var external = "192.168.0.4";

describe("creating URLs", function () {
    var opts, port, ipStub;
    before(function () {
        ipStub = sinon.stub(utils, "getHostIp").returns(external);
    });
    after(function () {
        ipStub.restore();
    });
    afterEach(function () {
        ipStub.reset();
    });
    beforeEach(function() {
        opts = {
            startPath: false
        };
        port = 3000;
    });
    it("should set the external", function () {
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.external, external);
    });
    it("should set the host (BACKWARDS COMPAT)", function () {
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.host, external);
    });
    it("should set the URLs", function () {
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.urls.local, "http://localhost:3000");
        assert.deepEqual(opts.urls.remote, "http://192.168.0.4:3000");
    });
    it("should set the URLs when using XIP", function () {
        opts.xip = true;
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.urls.local, "http://127.0.0.1.xip.io:3000");
        assert.deepEqual(opts.urls.remote, "http://192.168.0.4.xip.io:3000");
    });
});