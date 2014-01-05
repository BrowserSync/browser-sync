var bs = require("../../lib/browser-sync");
var controlPanel = require("../../lib/control-panel");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;
var fileWatcher = require("../../lib/file-watcher");

describe("Browser Sync: Start Services", function () {

    var args;
    var setupSocket;
    var launchControlPanel;
    var handleSocketConnection;
    var fileWatcherInit;
    var initServer;
    var ipStub;

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
        fileWatcherInit = sinon.stub(fileWatcher, "init");
        initServer = sinon.stub(browserSync, "initServer");
        launchControlPanel = sinon.stub(controlPanel, "launchControlPanel");
        ipStub = sinon.stub(browserSync, "getHostIp").returns("0.0.0.0");
    });

    afterEach(function () {
        setupSocket.reset();
        fileWatcherInit.reset();
        initServer.reset();
    });

    after(function () {
        setupSocket.restore();
        fileWatcherInit.restore();
        initServer.restore();
        ipStub.restore();
        launchControlPanel.restore();
    });

    it("should call setupSocket with the ports", function(){
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(setupSocket, args.ports);
    });
    it("should call handleSocketConnection", function(){
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(handleSocketConnection, browserSync.ghostModeCallbacks, {}, browserSync.handleClientSocketEvent);
    });
    it("should call filewatcher init", function () {
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(fileWatcherInit, browserSync.changeFile, browserSync.log, args.files, {}, args.options, browserSync);
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
    it("should always launch the control Panel", function () {
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(launchControlPanel, "0.0.0.0", args.ports, args.options, {});
    });
});