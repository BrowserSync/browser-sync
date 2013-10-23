var si = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var browserSync = new si();
var options = browserSync.options;

describe("Exposed Methods", function () {

    it("can be loaded", function () {
        expect(browserSync).toBeDefined();
    });

    describe("getting the Host IP", function () {

        var regex;
        beforeEach(function(){
            regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        });

        it("does not throw if no are options provided", function () {
            expect(function () {
                browserSync.getHostIp({});
            }).not.toThrow();
        });

        it("can retrieve the correct host IP address if one is already provided in options", function () {
            var hostIp = browserSync.getHostIp({
                host: "192.0.0.1"
            });
            expect(hostIp).toBe("192.0.0.1");
        });

        describe("using localhost as a fallback when no network available", function () {
            var hostIp;

            beforeEach(function(){
                hostIp = browserSync.getHostIp({detect:false});
            });
            it("can return '0.0.0.0' if no Network IP's are available", function () {
                expect(hostIp).toBe("0.0.0.0");
            });
        });
    });

    describe("getting a display-able base DIR for user", function () {

        var cwd = process.cwd();

        it("is correct when using ./ ", function () {
            var baseDir = browserSync.getBaseDir('./');
            expect(baseDir).toBe(cwd);
        });
        it("is correct when using only a dot", function () {
            expect(browserSync.getBaseDir('.')).toBe(cwd);
        });
        it("does not throw if no value is passed", function () {
            expect(function () {
                browserSync.getBaseDir();
            }).not.toThrow();
        });
        it("is correct when using no param", function () {
            var baseDir = browserSync.getBaseDir();
            expect(baseDir).toBe(cwd);
        });
        it("is correct when using a path", function () {
            expect(browserSync.getBaseDir("/app")).toBe(cwd + "/app");
        });
        it("is correct when using only a forward slash", function () {
            expect(browserSync.getBaseDir("/")).toBe(cwd);
        });
    });

    describe("logging messages to the console", function () {

        beforeEach(function(){
            spyOn(console, "log");
        });

        it("should log a message", function () {

            browserSync.log("ERROR", {debugInfo:true});
            expect(console.log).toHaveBeenCalledWith("ERROR");
        });
        it("should not log anything if turned off in options", function () {

            browserSync.log("ERROR", {debugInfo:false});
            expect(console.log).not.toHaveBeenCalled();
        });
        it("should log message if options turned off, but overridden", function () {

            browserSync.log("ERROR", {debugInfo:false}, true);
            expect(console.log).toHaveBeenCalled();
        });
    });

    describe("getting a file extension", function () {
        it("should return the file extension only", function () {
            expect(browserSync.getFileExtension("core.css")).toBe("css");
        });
    });

    describe("changing a file", function () {

        var io;

        beforeEach(function(){
            io = {};
            io.sockets = {
                emit: function () {}
            };
        });

        describe("returning the data sent to client when it's an inject file type.", function () {
            var data;
            beforeEach(function(){
                spyOn(io.sockets, "emit");
                data = browserSync.changeFile("/app/styles/core.css", io, options, browserSync);
            });

            it("should return the filename", function () {

                expect(data.assetFileName).toBe("core.css");

            });
            it("should return the fileExtension", function () {

                expect(data.fileExtension).toBe("css");
            });
            it("should emit the event with the correct data", function () {

                expect(io.sockets.emit).toHaveBeenCalledWith("reload", {
                    assetFileName: "core.css",
                    fileExtension: "css"
                });
            });
        });

        describe("returning the data sent to client when it's a reload file type", function () {
            var data;
            beforeEach(function(){
                spyOn(io.sockets, "emit");
                data = browserSync.changeFile("/app/index.php", io, options, browserSync);
            });

            it("should return the file path", function () {

                expect(data.url).toBe('/app/index.php');
            });

            it("should emit the event with the correct data", function () {

                expect(io.sockets.emit).toHaveBeenCalledWith("reload", {
                    url: "/app/index.php",
                    assetFileName: "index.php",
                    fileExtension: "php"
                });
            });
        });

        describe("logging info about the file change to the console", function () {
            beforeEach(function(){
                spyOn(messages.browser, "inject");
                spyOn(messages.browser, "reload");
            });

            it("should log the INJECT message when an inject file was changed", function () {
                browserSync.changeFile("/app/styles/core.css", io, options, browserSync);
                expect(messages.browser.inject).toHaveBeenCalled();
            });

            it("should log the INJECT message when an inject file was changed", function () {
                browserSync.changeFile("/app/styles/core.html", io, options, browserSync);
                expect(messages.browser.reload).toHaveBeenCalled();
            });
        });
    });

//    describe("getting the file extension", function () {
//        it("can get a file extension", function () {
//            expect(si.getExtension("core/strings/style.css")).toBe("css");
//        });
//    });

});
