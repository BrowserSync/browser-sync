var BrowserSync = require("../../lib/browser-sync");
var bs = new BrowserSync();
var messages = require("../../lib/messages");
var utils = require("../../lib/utils").utils;
var assert = require("chai").assert;
var sinon = require("sinon");
var server = require("../../lib/server");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002,
    proxy: 3003
};

var host = "0.0.0.0";
var proxyHost = "http://" + host + ":" + ports.proxy;
var serverHost = "http://" + host + ":" + ports.server;
var urlHost = "http://" + host + ":" + ports.proxy + "/app";

describe("Browser Sync: init Server", function () {

    var options;
    var launchServer;
    var open;
    var spy;
    var getUrl, logStub;

    before(function () {
        options = {};
        logStub = sinon.stub(utils, "log").returns(true);
        launchServer = sinon.stub(server, "launchServer").returns(true);
        open = sinon.stub(utils, "openBrowser").returns(true);
        getUrl = sinon.stub(utils, "getUrl").returns(urlHost);
        spy = sinon.spy();
    });

    afterEach(function () {
        open.reset();
        getUrl.reset();
        logStub.reset();
    });

    after(function () {
        launchServer.restore();
        open.restore();
        getUrl.restore();
        logStub.restore();
    });

    it("should call launchServer from module", function () {
        bs.initServer(host, ports, options, spy);
        sinon.assert.calledWithExactly(launchServer, host, ports, options, spy);
    });

    it("should call open browser with server port", function () {

        var url = "http://" + host + ":" + ports.server;
        getUrl.returns(url);
        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true,
                openBrowser: true
            }
        };
        bs.initServer(host, ports, options);
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
        bs.initServer(host, ports, options);
        var actual = options.url;
        var expected = serverHost;
        assert.equal(actual, expected);
    });
    it("should Set the URL on the options when server used", function () {

        getUrl.returns("http://0.0.0.0:3003");

        var options = {
            proxy: {
                host: "local.dev"
            }
        };
        bs.initServer(host, ports, options);
        var actual = options.url;
        var expected = proxyHost;
        assert.equal(actual, expected);
    });
    it("should call open browser with proxy port", function () {

        getUrl.returns("http://0.0.0.0:3003");
        var options = {
            proxy: {
                host: "127.0.0.1"
            }
        };

        var url = proxyHost;

        bs.initServer(host, ports, options);
        sinon.assert.calledWithExactly(open, url, options);
    });
    it("should call getUrl", function () {

        var options = {
            proxy: {
                host: "127.0.0.1"
            }
        };

        var url = proxyHost;

        bs.initServer(host, ports, options);
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

            bs.initServer(host, ports, options);
            sinon.assert.calledWithExactly(initServer, host, ports.server, "./");
            sinon.assert.calledWithExactly(logStub, "Server Message", options, true);
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

            bs.initServer(host, ports, options);
            sinon.assert.calledWithExactly(initProxy, host, ports.proxy);
            sinon.assert.calledWithExactly(logStub, "Proxy Message", options, true);
        });
    });
});