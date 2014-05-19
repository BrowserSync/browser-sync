"use strict";

var messages    = require("../../../lib/messages");
var utils       = require("../../../lib/utils").utils;
var server      = require("../../../lib/server");
var BrowserSync = require("../../../lib/browser-sync");
var bs          = new BrowserSync();

var assert      = require("chai").assert;
var sinon       = require("sinon");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002,
    proxy: 3003
};

var host       = "0.0.0.0";
var proxyHost  = "http://" + host + ":" + ports.proxy;
var serverHost = "http://" + host + ":" + ports.server;
var urlHost    = "http://" + host + ":" + ports.proxy + "/app";

describe("Browser Sync: init Server", function () {

    var options;
    var launchServer;
    var open;
    var spy;
    var getUrl, logStub;
    var emitterStub;

    before(function () {
        options = {};
        logStub = sinon.stub(utils, "log").returns(true);
        emitterStub = sinon.stub(bs.events, "emit");
        launchServer = sinon.stub(server, "launchServer").returns(true);
        open = sinon.stub(utils, "openBrowser").returns(true);
        getUrl = sinon.stub(utils, "getUrl").returns(urlHost);
        spy = sinon.spy();
    });

    afterEach(function () {
        open.reset();
        getUrl.reset();
        logStub.reset();
        emitterStub.reset();
    });

    after(function () {
        launchServer.restore();
        open.restore();
        getUrl.restore();
        logStub.restore();
        emitterStub.restore();
    });

    it("should call launchServer from module", function () {

        bs.initServer(host, ports, options, spy);
        sinon.assert.calledWithExactly(launchServer, host, ports, options, spy);
    });

    it.skip("should call open browser with server port", function () {

        var url = "http://" + host + ":" + ports.server;
        getUrl.returns(url);
        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true,
                openBrowser: true
            }
        };
        bs.initServer(host, ports, options, spy);
        var args = open.getCall(0);
        sinon.assert.calledWithExactly(open, url, options);
    });
    it("should Set the URL on the options when server used", function () {

        var url = "http://" + host + ":" + ports.server;
        getUrl.returns("http://0.0.0.0:3002");

        var options = {
            server: {
                baseDir: "test/fixtures"
            }
        };
        bs.initServer(host, ports, options, spy);
        var actual = options.url;
        assert.equal(actual, serverHost);
    });
    it("should Set the URL on the options when server used", function () {

        getUrl.returns("http://0.0.0.0:3003");

        var options = {
            proxy: {
                host: "local.dev"
            }
        };
        bs.initServer(host, ports, options, spy);
        var actual = options.url;
        assert.equal(actual, proxyHost);
    });
    it.skip("should call open browser with proxy port", function () {

        getUrl.returns("http://0.0.0.0:3003");
        var options = {
            proxy: {
                host: "127.0.0.1"
            }
        };

        var url = proxyHost;

        bs.initServer(host, ports, options, spy);
        sinon.assert.calledWithExactly(open, url, options);
    });
    it("should call getUrl", function () {

        var options = {
            proxy: {
                host: "127.0.0.1"
            }
        };

        var url = proxyHost;

        bs.initServer(host, ports, options, spy);
        sinon.assert.calledWithExactly(getUrl, url, options);
    });
    describe("logging about servers", function () {

        var init;
        var initServer;
        var initProxy;

        before(function () {
            init       = sinon.stub(messages, "init").returns("No server or Proxy");
            initServer = sinon.stub(messages, "initServer").returns("Server Message");
            initProxy  = sinon.stub(messages, "initProxy").returns("Proxy Message");
        });
        after(function () {
            init.restore();
            initServer.restore();
            initProxy.restore();
        });

        it("logs when using static server", function () {

            var stub = sinon.stub(utils, "getBaseDir").returns("./");

            var options = {
                server: {
                    baseDir: "test/fixtures",
                    injectScripts: true,
                    openBrowser: true
                }
            };

            bs.initServer(host, ports, options, spy);
            var open = emitterStub.getCall(0).args[0];
            var data = emitterStub.getCall(0).args[1];

            assert.equal(open, "running");

            assert.equal(data.port, 3002);
            assert.equal(data.type, "server");
            stub.restore();
        });

        it("logs when using proxy", function () {

            var ports = {
                socket: 3000,
                controlPanel: 3001,
                proxy: 3002
            };

            var options = {
                proxy: {
                    host: "127.0.0.0",
                    port: 8001
                }
            };

            bs.initServer(host, ports, options, spy);

            var open = emitterStub.getCall(0).args[0];
            var data = emitterStub.getCall(0).args[1];

            assert.equal(open, "running");

            assert.equal(data.port, 3002);
            assert.equal(data.type, "proxy");
        });
    });
});
