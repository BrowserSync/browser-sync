var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;
var server = require("../../lib/server");

describe("Browser Sync: init Server", function () {

    var host = "0.0.0.0";
    var ports = {
        socket: 3000,
        controlPanel: 3001,
        server: 3002
    };
    var options = {};

    var launchServer;
    var open;
    var spy;

    before(function () {
        launchServer = sinon.stub(server, "launchServer").returns(true);
        open = sinon.stub(browserSync, "openBrowser").returns(true);
        spy = sinon.spy();
    });

    afterEach(function () {
        launchServer.reset();
        open.reset();
    });

    after(function () {
        launchServer.restore();
        open.restore();
    });

    it("should call launchServer from module", function () {
        browserSync.initServer(host, ports, options, spy);
        sinon.assert.calledWithExactly(launchServer, host, ports, options, spy);
    });

    it("can call open browser with control panel", function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true,
                openBrowser: true
            }
        };

        browserSync.initServer(host, ports, options);
        sinon.assert.calledWithExactly(open, host, ports.controlPanel, options);
    });

    describe("logging about servers", function () {

        var init;
        var initServer;
        var initProxy;
        var log;

        before(function () {
            init       = sinon.stub(messages, "init").returns("No server or Proxy");
            initServer = sinon.stub(messages, "initServer").returns("Server Message");
            initProxy  = sinon.stub(messages, "initProxy").returns("Proxy Message");
            log        = sinon.stub(browserSync, "log");
        });
        afterEach(function () {
            log.reset();
        });
        after(function () {
            init.restore();
            initServer.restore();
            initProxy.restore();
            log.restore();
        });

        it("logs when using static server", function () {

            var stub = sinon.stub(browserSync, "getBaseDir").returns("./");

            var options = {
                server: {
                    baseDir: "test/fixtures",
                    injectScripts: true,
                    openBrowser: true
                }
            };

            browserSync.initServer(host, ports, options);
            sinon.assert.calledWithExactly(initServer, host, ports.server, "./");
            sinon.assert.calledWithExactly(log, "Server Message", options, true);
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

            browserSync.initServer(host, ports, options);
            sinon.assert.calledWithExactly(initProxy, host, ports.proxy);
            sinon.assert.calledWithExactly(log, "Proxy Message", options, true);
        });

        it("logs when not using server OR proxy", function () {
            var options = {};
            browserSync.initServer(host, ports, options);
            sinon.assert.calledWithExactly(init, host, ports);
            sinon.assert.calledWithExactly(log, "No server or Proxy", options, true);
        });
    });
});