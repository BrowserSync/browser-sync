var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;

describe("Exposed Methods", function () {

    it("can be loaded", function () {
        assert.isDefined(browserSync);
    });

    describe("getting the Host IP", function () {

        var regex;
        beforeEach(function () {
            regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        });

        it("does not throw if no are options provided", function () {
            assert.doesNotThrow(function () {
                browserSync.getHostIp({});
            });
        });

        it("should use the IP address if provided in the options", function () {
            var hostIp = browserSync.getHostIp({
                host: "192.0.0.1"
            });
            assert.equal(hostIp, "192.0.0.1");
        });

        it("should use 0.0.0.0 as a fallback when detect:false", function () {
            var hostIp = browserSync.getHostIp({
                detect: false
            });
            assert.equal(hostIp, "0.0.0.0");
        });

        it("should use 0.0.0.0 as a fallback when no network available", function () {
            var hostIp = browserSync.getHostIp({}, null);
            assert.equal(hostIp, "0.0.0.0");
        });
    });

    describe("naming the ports", function () {
        it("can assign names to the 2 required ports", function () {
            var ports = [3000,3001];
            var names = ["socket", "controlPanel"];
            var named = browserSync.assignPortNames(ports, names);
            assert.equal(named.socket, 3000);
            assert.equal(named.controlPanel, 3001);
        });
        it("can assign names to the 2 required ports + client server", function () {
            var ports = [3000,3001,3002];
            var names = ["socket", "controlPanel", "server"];
            var named = browserSync.assignPortNames(ports, names);
            assert.equal(named.socket, 3000);
            assert.equal(named.controlPanel, 3001);
            assert.equal(named.server, 3002);
        });
        it("can assign names to the 2 required ports + client proxy", function () {
            var ports = [3000,3001,3002];
            var names = ["socket", "controlPanel", "proxy"];
            var named = browserSync.assignPortNames(ports, names);
            assert.equal(named.socket, 3000);
            assert.equal(named.controlPanel, 3001);
            assert.equal(named.proxy, 3002);
        });
    });

    describe("getting a display-able base DIR for server", function () {

        var cwd = process.cwd();

        it("is correct when using ./ ", function () {
            var actual = browserSync.getBaseDir("./");
            assert.equal(actual, cwd);
        });
        it("is correct when using only a dot", function () {
            var actual = browserSync.getBaseDir(".");
            assert.equal(actual, cwd);
        });
        it("does not throw if no value is passed", function () {
            assert.doesNotThrow(function () {
                browserSync.getBaseDir();
            });
        });
        it("is correct when using no param", function () {
            var actual = browserSync.getBaseDir();
            assert.equal(actual, cwd);
        });
        it("is correct when using a path", function () {
            var actual = browserSync.getBaseDir("/app");
            var expected = cwd + "/app";
            assert.equal(actual, expected);
        });
        it("is correct when using only a forward slash", function () {
            var actual = browserSync.getBaseDir("/");
            assert.equal(actual, cwd);
        });
    });

    describe("logging messages to the console", function () {

        var spy;
        before(function () {
            spy = sinon.spy(console, "log");
        });
        afterEach(function () {
            spy.reset();
        });
        after(function () {
            spy.restore();
        });
        it("should log a message", function () {
            browserSync.log("ERROR", {debugInfo: true});
            assert.isTrue(spy.called);
        });
        it("should not log if disabled in options", function () {
            browserSync.log("ERROR", {debugInfo: false});
            assert.isFalse(spy.called);
        });
        it("should log message if disabled in options, but overridden with param", function () {
            browserSync.log("ERROR", {debugInfo: false}, true);
            assert.isTrue(spy.called);
        });
    });

    describe("getting a file extension", function () {
        it("should return the file extension only (1)", function () {
            var actual = browserSync.getFileExtension("core.css");
            var expected = "css";
            assert.equal(actual, expected);
        });
        it("should return the file extension only (2)", function () {
            var actual = browserSync.getFileExtension("index.html");
            var expected = "html";
            assert.equal(actual, expected);
        });
        it("should return the file extension only (3)", function () {
            var actual = browserSync.getFileExtension("index.php");
            var expected = "php";
            assert.equal(actual, expected);
        });
    });

    describe("stripping OS path from filepath", function () {

        it("can remove the OS prefix from a filepath", function () {
            var full     = "/Users/shakyshane/sites/browser-sync/app/index.html";
            var actual   = browserSync.resolveRelativeFilePath(full, "/Users/shakyshane/sites/browser-sync");
            var expected = "app/index.html";
            assert.equal(actual, expected);
        });
    });

    describe("changing a file", function () {

        var io, spy;

        before(function () {
            io = {};
            io.sockets = {
                emit: function () {
                }
            };
            spy = sinon.spy(io.sockets, "emit");
        });

        afterEach(function () {
            spy.reset();
        });

        describe("returning the data sent to client when it's an inject file type.", function () {

            var data;

            beforeEach(function () {
                data = browserSync.changeFile("/app/styles/core.css", io, options, browserSync);
            });

            it("should return the filename", function () {
                assert.equal(data.assetFileName, "core.css");
            });
            it("should return the fileExtension", function () {
                assert.equal(data.fileExtension, "css");
            });
            it("should emit the event with the correct data", function () {
                sinon.assert.calledWithExactly(spy, "reload", {
                    assetFileName: "core.css",
                    fileExtension: "css"
                });
            });
        });

        describe("returning the data sent to client when it's a reload file type", function () {

            var data;

            beforeEach(function () {
                data = browserSync.changeFile("/app/index.php", io, options, browserSync);
            });

            it("should return the filename", function () {
                assert.equal(data.assetFileName, "index.php");
            });
            it("should return the fileExtension", function () {
                assert.equal(data.fileExtension, "php");
            });

            it("should emit the event with the correct data", function () {

                sinon.assert.calledWithExactly(spy, "reload", {
                    url: "/app/index.php",
                    assetFileName: "index.php",
                    fileExtension: "php"
                });
            });
        });

        describe("logging info about the file change to the console", function () {

            it("should log which file is changed", function () {

                var spy = sinon.spy(messages.files, "changed");

                // fake the CWD
                browserSync.cwd = "/Users/shakyshane/browser-sync";

                browserSync.changeFile("/Users/shakyshane/browser-sync/app/css/styles.css", io, options, browserSync);

                sinon.assert.calledWithExactly(spy, "app/css/styles.css");

            });
            it("should log the INJECT message when an inject file was changed", function () {
                var spy = sinon.spy(messages.browser, "inject");
                browserSync.changeFile("/app/styles/core.css", io, options, browserSync);
                sinon.assert.called(spy);
            });

            it("should log the INJECT message when an inject file was changed", function () {
                var spy = sinon.spy(messages.browser, "reload");
                browserSync.changeFile("/app/styles/core.html", io, options, browserSync);
                sinon.assert.called(spy);
            });
        });
    });
});
