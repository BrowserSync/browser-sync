var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;
var assert = require("chai").assert;

describe("Utils: getting the Host IP", function() {
    var regex;
    beforeEach(function() {
        regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    });
    it("should use the IP address if provided in the options", function() {
        var hostIp = utils.getHostIp(
            merge({ host: "192.0.0.1" })[0],
            "192.168.0.4"
        );
        assert.equal(hostIp, "192.0.0.1");
    });
    it("should return false detect:false", function() {
        var hostIp = utils.getHostIp(
            merge({ detect: false })[0],
            "192.168.0.4"
        );
        assert.equal(hostIp, false);
    });
    it("should return false when no network available", function() {
        var hostIp = utils.getHostIp(merge()[0], []);
        assert.equal(hostIp, false);
    });
    it("should return the ip if given as string", function() {
        var actual = utils.getHostIp(
            merge({ host: "127.0.0.2" })[0],
            "192.168.0.4"
        );
        assert.equal(actual, "127.0.0.2");
    });
    it("should return the first ip if given array", function() {
        var stubs = ["127.0.0.2", "21.23.4.6"];
        var actual = utils.getHostIp(merge()[0], stubs);
        assert.equal(actual, stubs[0]);
    });
});
