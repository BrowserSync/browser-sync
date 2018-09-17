require("source-map-support").install();
var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;

var assert = require("chai").assert;
var sinon = require("sinon");

var external = "192.168.0.4";

describe("Utils: creating URLs", function() {
    var opts, ipStub;
    before(function() {
        ipStub = sinon.stub(utils, "getHostIp").returns(external);
    });
    after(function() {
        ipStub.restore();
    });
    afterEach(function() {
        ipStub.reset();
    });
    beforeEach(function() {
        [opts, errors] = merge({
            port: 3000,
            server: true,
            scheme: "http"
        });
    });
    it("should return the local when offline", function() {
        var [opts, errors] = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: false
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000"
        });
    });
    it("should return the external", function() {
        var [opts, errors] = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: true
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000",
            external: "http://" + external + ":3000"
        });
    });
    it("should return the external/local with xip", function() {
        var [opts, errors] = merge({
            port: 3000,
            server: true,
            https: true,
            online: true,
            xip: true
        });
        var out = utils.getUrlOptions(opts);
        assert.equal(out.get("local"), "https://127.0.0.1.xip.io:3000");
        assert.equal(
            out.get("external"),
            "https://" + external + ".xip.io:3000"
        );
    });
    it("should return the URLs when OFFLINE & XIP set", function() {
        var [opts, errors] = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: false,
            xip: true
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000"
        });
    });
    it("should NOT ALLOW 'listen' and 'host' options if they differ", function() {
        var [opts, errors] = merge({
            port: 3000,
            host: "mysite.test",
            listen: "localhost"
        });

        assert.equal(errors.length, 1);
        assert.equal(errors[0].type, "HostAndListenIncompatible");
        assert.equal(errors[0].level, "Fatal");
    });
    it("should ALLOW 'listen' and 'host' option if they are the same", function() {
        var [opts, errors] = merge({
            port: 3000,
            host: "localhost",
            listen: "localhost"
        });

        assert.deepEqual(opts.get("listen"), "localhost");
        assert.isUndefined(opts.get("host"));
    });
});
