var bs       = require("../../../lib/browser-sync");
var messages = require("../../../lib/messages");
var bsApi    = require("../../../lib/api");

var assert   = require("chai").assert;
var sinon    = require("sinon");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

var host  = "0.0.0.0";
var snippet = messages.scriptTags(host, ports, {});

describe("returning API methods by requiring api", function () {
    var api;
    var options;
    var servers;
    before(function () {
        options = {
            host: host
        };
        servers = {

        };
        api = bsApi.getApi(ports, options, servers);
    });
    it("should be a function", function () {
        assert.isFunction(bsApi.getApi);
    });
    it("should have a snippet property", function () {
        assert.isDefined(api.snippet);
    });
    it("should have a snippet property that contains script tags", function () {
        var actual   = api.snippet;
        assert.equal(actual, snippet);
    });
    it("should have the options property", function () {
        assert.isDefined(api.options);
    });
    it("should return the servers info", function () {
        assert.isDefined(api.servers);
    });
});