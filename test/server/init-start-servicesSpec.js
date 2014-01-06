var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;
var fileWatcher = require("../../lib/file-watcher");

describe("Browser Sync: Start Services", function () {

    var args = {
        files: ["**/*.css"],
        ports: {
            min: 3000,
            max: 4000
        },
        options: {}
    };

    var setupSocket;
    var handleSocketConnection;
    var fileWatcherInit;
    var initServer;

    before(function () {
        setupSocket = sinon.stub(browserSync, "setupSocket").returns({});
        handleSocketConnection = sinon.stub(browserSync, "handleSocketConnection");
        fileWatcherInit = sinon.stub(fileWatcher, "init");
        initServer = sinon.stub(browserSync, "initServer");
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
    it("should call launch Server", function () {
        sinon.stub(browserSync, "getHostIp").returns("0.0.0.0");
        browserSync.startServices(args);
        sinon.assert.calledWithExactly(initServer, "0.0.0.0", args.ports, args.options, {});
    });
});