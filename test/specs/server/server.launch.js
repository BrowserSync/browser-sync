"use strict";

var messages    = require("../../../lib/messages");
var utils       = require("../../../lib/utils").utils;
var server      = require("../../../lib/server/");
var BrowserSync = require("../../../lib/browser-sync");
var bs          = new BrowserSync();

var assert      = require("chai").assert;
var sinon       = require("sinon");

var port       = 3000;
var host       = "0.0.0.0";
var urlHost    = "http://" + host + ":" + port + "/app";

describe("Server:  Browser Sync: init Server", function () {

    var options;
    var createServer;
    var open;
    var spy;
    var getUrl, logStub;
    var emitterStub;

    before(function () {
        options = {};
        logStub = sinon.stub(utils, "log").returns(true);
        emitterStub = sinon.stub(bs.events, "emit");
        createServer = sinon.stub(server, "createServer").returns(require("http").HttpServer);
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
        createServer.restore();
        open.restore();
        getUrl.restore();
        logStub.restore();
        emitterStub.restore();
    });

    describe("logging about servers", function () {

        var init;
        var initServer;
        var initProxy;

        before(function () {
            init       = sinon.stub(messages, "initSnippet").returns("No server or Proxy");
            initServer = sinon.stub(messages, "initServer").returns("Server Message");
            initProxy  = sinon.stub(messages, "initProxy").returns("Proxy Message");
        });
        after(function () {
            init.restore();
            initServer.restore();
            initProxy.restore();
        });

        it("logs when using static server", function () {

            var stub = sinon.stub(utils, "getBaseDir").returns("test/fixtures");

            var options = {
                host: host,
                port: port,
                urls: {
                    local: "http://localhost:3000"
                },
                online: true,
                server: {
                    baseDir: "test/fixtures",
                    injectScripts: true,
                    openBrowser: true
                }
            };

            bs.initServer(options, spy);

            var open = emitterStub.getCall(0).args[0];
            var data = emitterStub.getCall(0).args[1];

            assert.equal(open, "service:running");

            assert.equal(data.type, "server");
            assert.equal(data.baseDir, "test/fixtures");
            assert.equal(data.port, 3000);
            assert.equal(data.tunnel, false);
            assert.equal(data.url, "http://localhost:3000");
            stub.restore();

        });

        it("logs when using proxy", function () {

            var options = {
                host: host,
                port: port,
                urls: {
                    local: "http://localhost:3000"
                },
                proxy: {
                    host: "127.0.0.0",
                    port: 8001
                }
            };

            bs.initServer(options, spy);

            var open = emitterStub.getCall(0).args[0];
            var data = emitterStub.getCall(0).args[1];

            assert.equal(open, "service:running");

            assert.equal(data.type, "proxy");
            assert.equal(data.port, 3000);
            assert.equal(data.tunnel, false);
            assert.equal(data.url, "http://localhost:3000");
        });
        it("logs when using Snippet", function () {

            createServer.returns(false);

            bs.initServer({host:host,port:port}, spy);

            var open = emitterStub.getCall(0).args[0];
            var data = emitterStub.getCall(0).args[1];

            assert.equal(open, "service:running");

            assert.equal(data.port, 3000);
            assert.equal(data.type, "snippet");
            assert.equal(data.url, "n/a");
            assert.equal(data.tunnel, false);
        });
    });
});
