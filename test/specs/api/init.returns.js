//"use strict";
//
//var index = require("../../../lib/index");
//
//var assert      = require("chai").assert;
//var sinon       = require("sinon");
//
//describe("Init method", function () {
//
//    var startStub;
//    var options;
//    before(function () {
//        startStub = sinon.stub(index, "start");
//    });
//    beforeEach(function () {
//        options = {
//            server: {
//                baseDir: "./"
//            }
//        };
//    });
//    afterEach(function () {
//        startStub.reset();
//    });
//    after(function () {
//        startStub.restore();
//    });
//    it("should accept files, config & callback", function () {
//        index.init("*.css", {server: true});
//        var actual = startStub.getCall(0).args[1].server.baseDir;
//        var expected = "./";
//        assert.deepEqual(actual, expected);
//    });
//    it("should accept files, config & callback", function () {
//        index.init("*.css", options);
//        var actual = startStub.getCall(0).args[1].server.baseDir;
//        var expected = "./";
//        assert.deepEqual(actual, expected);
//    });
//    it("should accept files, config & callback", function () {
//        options.server.index = "index.htm";
//        index.init("*.css", options);
//        var actual = startStub.getCall(0).args[1].server.index;
//        var expected = "index.htm";
//        assert.deepEqual(actual, expected);
//    });
//    it("should accept files, config & callback", function () {
//
//        options.proxy  = "http://localhost";
//        options.server = false;
//        index.init("*.css", options);
//
//        var proxyCall    = startStub.getCall(0).args[1].proxy;
//        var host     = proxyCall.host;
//        var protocol = proxyCall.protocol;
//        var port     = proxyCall.port;
//        assert.equal(host, "localhost");
//        assert.equal(protocol, "http");
//        assert.equal(port, 80);
//    });
//
//    it("should accept files, config & callback", function () {
//
//        options.proxy  = "local.dev";
//        options.server = false;
//        index.init("*.css", options);
//
//        var proxyCall = startStub.getCall(0).args[1].proxy;
//        var host      = proxyCall.host;
//        var protocol  = proxyCall.protocol;
//        var port      = proxyCall.port;
//        assert.equal(host, "local.dev");
//        assert.equal(protocol, "http");
//        assert.equal(port, 80);
//    });
//
//    it("should accept files, config & callback", function () {
//
//        options.proxy  = "local.dev:8010";
//        options.server = false;
//        index.init("*.css", options);
//
//        var proxyCall = startStub.getCall(0).args[1].proxy;
//        var host      = proxyCall.host;
//        var protocol  = proxyCall.protocol;
//        var port      = proxyCall.port;
//
//        assert.equal(host, "local.dev");
//        assert.equal(protocol, "http");
//        assert.equal(port, 8010);
//    });
//    it("should accept files, config & callback", function () {
//        options.exclude = "node_modules";
//        options.server = false;
//        index.init("*.css", options);
//        var filesCall = startStub.getCall(0).args[0];
//        assert.deepEqual(filesCall, ["*.css", "!node_modules/**"]);
//    });
//});