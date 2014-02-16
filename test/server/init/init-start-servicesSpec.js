var bs = require("../../../lib/browser-sync");
var controlPanel = require("../../../lib/control-panel");
var messages = require("../../../lib/messages");
var api = require("../../../lib/api");
var devIp = require("dev-ip");
var events = require("events");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var _ = require("lodash");
var options = browserSync.options;
var fileWatcher = require("../../../lib/file-watcher");

describe("Browser Sync: Start Services", function () {

    var args;
    var setupSocket;
    var launchControlPanel;
    var handleSocketConnection;
    var fileWatcherInit;
    var initServer;
    var ipStub;
    var callbacksStub;
    var initMessage;
    var log;
    var devIpStub;
    var getApiStub;

    beforeEach(function () {
        args = {
            files: ["**/*.css"],
            ports: {
                min: 3000,
                max: 4000
            },
            options: {}
        };
    });

    before(function () {
        setupSocket = sinon.stub(browserSync, "setupSocket").returns({});
        handleSocketConnection = sinon.stub(browserSync, "handleSocketConnection");
        callbacksStub = sinon.stub(browserSync, "getSocketCallbacks").returns(["CALLBACKS"]);
        fileWatcherInit = sinon.stub(fileWatcher, "init");
        initServer = sinon.stub(browserSync, "initServer");
        initMessage = sinon.stub(messages, "init").returns("INIT");
        log = sinon.stub(browserSync, "log").returns("LOGGED");
        launchControlPanel = sinon.stub(controlPanel, "launchControlPanel");
        ipStub = sinon.stub(browserSync, "getHostIp").returns("0.0.0.0");
        devIpStub = sinon.stub(devIp, "getIp").returns("0.0.0.0");
        getApiStub = sinon.stub(api, "getApi").returns({test: "value"});
    });

    afterEach(function () {
        setupSocket.reset();
        fileWatcherInit.reset();
        initServer.reset();
    });

    after(function () {
        setupSocket.restore();
        callbacksStub.restore();
        fileWatcherInit.restore();
        initServer.restore();
        ipStub.restore();
        launchControlPanel.restore();
        log.restore();
        initMessage.restore();
        devIpStub.restore();
    });

    it("should call set the host on the options Object", function(){
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(ipStub, args.options, "0.0.0.0");
    });
    it("should call setupSocket with the ports", function(){
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(setupSocket, args.ports);
    });
    it("should call handleSocketConnection", function(){
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(handleSocketConnection, ["CALLBACKS"], args.options, browserSync.handleClientSocketEvent);
    });
    it("should call filewatcher init", function () {
        var emitter = browserSync.getEmitter();
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(fileWatcherInit, args.files, args.options, emitter);
    });
    it("should NOT call launch Server niether server or proxy provided", function () {
        browserSync.startServices(args);
        sinon.assert.notCalled(initServer);
    });
    it("should call launch Server if server in options", function () {
        args.options.server = true;
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(initServer, "0.0.0.0", args.ports, args.options, {});
    });
    it("should call launch Server if proxy in options", function () {
        args.options.proxy = true;
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(initServer, "0.0.0.0", args.ports, args.options, {});
    });
    it("Should get the init message if server & proxy not used", function () {
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(initMessage, "0.0.0.0", args.ports, args.options);
    });
    it("should log snippets when no server or proxy used", function () {
        browserSync.startServices(args);
        sinon.assert.called(log);
    });
    it("should get the API", function () {
        browserSync.startServices(args);
        sinon.assert.called(getApiStub);
    });
    it("should emit the init event with the API", function () {
        var emitter = browserSync.getEmitter();
        var stub = sinon.stub(emitter, "emit");
        var actual = browserSync.startServices(args);
        sinon.assert.calledWithExactly(stub, "init", {test: "value"});
        stub.restore();
    });
});