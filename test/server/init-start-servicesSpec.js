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
    var launchServer;

    before(function () {
        setupSocket = sinon.stub(browserSync, "setupSocket").returns({});
        handleSocketConnection = sinon.stub(browserSync, "handleSocketConnection");
        fileWatcherInit = sinon.stub(fileWatcher, "init");
        launchServer = sinon.stub(browserSync, "initServer");
    });

    afterEach(function () {
        setupSocket.reset();
        fileWatcherInit.reset();
        launchServer.reset();
    });

    after(function () {
        setupSocket.restore();
        fileWatcherInit.restore();
        launchServer.restore();
    });

    it("should call setupSocket with the ports", function(){
        browserSync.startServices(args);
        sinon.assert.calledWith(setupSocket, args.ports);
    });
    it("should call handleSocketConnection", function(){
        browserSync.startServices(args);
        sinon.assert.calledWith(handleSocketConnection, browserSync.ghostModeCallbacks, {}, browserSync.handleClientSocketEvent);
    });
    it("should call filewatcher init", function () {
        browserSync.startServices(args);
        sinon.assert.calledWith(fileWatcherInit, browserSync.changeFile, browserSync.log, args.files, {}, args.options, browserSync);
    });
    it("should call launch Server", function () {
        sinon.stub(browserSync, "getHostIp").returns("0.0.0.0");
        browserSync.startServices(args);
        sinon.assert.calledWith(launchServer, "0.0.0.0", args.ports, args.options);
    });
});