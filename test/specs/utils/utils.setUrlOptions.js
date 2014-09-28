"use strict";

var utils    = require("../../../lib/utils");

var assert   = require("chai").assert;
var sinon    = require("sinon");

var external = "192.168.0.4";

describe("Utils: creating URLs", function () {
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
    beforeEach(function () {
        opts = {
            startPath: false,
            online: true
        };
        port = 3000;
    });
    it("should return the external", function () {
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.external, external);
    });
    it("should return the host (BACKWARDS COMPAT)", function () {
        utils.setUrlOptions(port, opts);
        assert.deepEqual(opts.host, external);
    });
    it("should return the URLs", function () {
        var urls = utils.setUrlOptions(port, opts);
        assert.deepEqual(urls.local, "http://localhost:3000");
        assert.deepEqual(urls.external, "http://192.168.0.4:3000");
    });
    it("should return the URLs when using XIP", function () {
        opts.xip = true;
        var urls = utils.setUrlOptions(port, opts);
        assert.deepEqual(urls.local, "http://127.0.0.1.xip.io:3000");
        assert.deepEqual(urls.external, "http://192.168.0.4.xip.io:3000");
    });
    it("should return the URLs when OFFLINE", function () {
        opts.online = false;
        var urls = utils.setUrlOptions(port, opts);
        assert.deepEqual(urls.local, "http://localhost:3000");
        assert.isUndefined(urls.external);
    });
    it("should return the URLs when OFFLINE & XIP set", function () {
        opts.online = false;
        opts.xip = true;
        var urls = utils.setUrlOptions(port, opts);
        assert.deepEqual(urls.local, "http://localhost:3000");
        assert.isUndefined(urls.external);
    });
});
