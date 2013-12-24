var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;

describe("Starting Services: ", function () {

    var options,
        ports,
        files,
        setupSocket,
        handleSocketConnection,
        launchServer,
        watchFiles,
        getHostIp;

    before(function () {

        setupSocket             = sinon.stub(browserSync, "setupSocket");
        setupSocket.returns("socket");
        handleSocketConnection  = sinon.stub(browserSync, "handleSocketConnection");
        launchServer            = sinon.stub(browserSync, "launchServer");
        watchFiles              = sinon.stub(browserSync, "watchFiles");
        getHostIp               = sinon.stub(browserSync, "getHostIp");

    });

    afterEach(function () {
        setupSocket.reset();
        handleSocketConnection.reset();
        launchServer.reset();
        watchFiles.reset();
        getHostIp.reset();
    });

    after(function () {
        setupSocket.restore();
        handleSocketConnection.restore();
        launchServer.restore();
        watchFiles.restore();
        getHostIp.restore();
    });

    describe("Setting up with correct config", function () {
        var ports, files, options;
        beforeEach(function () {

            getHostIp.returns("0.0.0.0");

            ports = [3002, 3004, 3005];
            options = {};
            files = "**/*.css";

            browserSync.startServices(ports, files, options);
        });
        it("should setup Socket IO", function () {
            var actual = setupSocket.calledWith(ports);
            assert.equal(actual, true);
        });
        it("should set up event callbacks", function () {
            var actual = handleSocketConnection.calledWith(browserSync.callbacks, {}, browserSync.handleClientSocketEvent);
            assert.equal(actual, true);
        });
        it("should setup the Server", function () {
            var actual = launchServer.calledWith("0.0.0.0", ports, {});
            assert.equal(actual, true);
        });
        it("should watch files", function () {
            var actual = watchFiles.calledWith(files, "socket", browserSync.changeFile, options);
            assert.equal(actual, true);
        });
    });
});