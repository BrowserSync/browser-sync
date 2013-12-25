var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;
var server = require("../../lib/server");

describe("Browser Sync: init Server", function () {

    var host = "0.0.0.0";
    var ports = [3000, 3001, 3002];
    var options = {};

    var launchServer;
    var open;

    before(function () {
        launchServer = sinon.stub(server, "launchServer").returns(true);
        open = sinon.stub(browserSync, "openBrowser").returns(true);
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
        browserSync.initServer(host, ports, options);
        sinon.assert.calledWith(launchServer, host, ports, options);
    });

    it("can call open browser with args for SERVER", function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true,
                openBrowser: true
            }
        };

        browserSync.initServer(host, ports, options);
        sinon.assert.calledWith(open, host, ports[1], options);
    });

    it("can call open browser with args for Proxy", function () {

        var options = {
            proxy: {
                host: "127.0.0.0",
                port: 8001
            }
        };

        browserSync.initServer(host, ports, options);
        sinon.assert.calledWith(open, host, ports[2], options);
    });

    it("does NOT call openBrowser if neither Server or Proxy used.", function () {
        var options = {};
        browserSync.initServer(host, ports, options);
        sinon.assert.notCalled(open);
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
            sinon.assert.calledWith(initServer, host, ports[1], "./");
            sinon.assert.calledWith(log, "Server Message", options, true);
            stub.restore();
        });

        it("logs when using proxy", function () {

            var options = {
                proxy: {
                    host: "127.0.0.0",
                    port: 8001
                }
            };

            browserSync.initServer(host, ports, options);
            sinon.assert.calledWith(initProxy, host, ports[2]);
            sinon.assert.calledWith(log, "Proxy Message", options, true);
        });

        it("logs when not using server OR proxy", function () {

            var options = {};

            browserSync.initServer(host, ports, options);
            sinon.assert.calledWith(init, host, ports[0], ports[1]);
            sinon.assert.calledWith(log, "No server or Proxy", options, true);
        });
    });
});