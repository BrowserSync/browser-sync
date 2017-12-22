var browserSync = require("../../../");
var path = require("path");
var outpath = path.join(__dirname, "../../fixtures");
var fs = require("graceful-fs");

var tempFileContent = "A test generated this file and it is safe to delete";
var writeTimeout = 150; // Wait for it to get to the filesystem
var assert = require("assert");

var writeFileWait = function(name, content, cb) {
    if (!cb) {
        cb = function() {};
    }
    setTimeout(function() {
        fs.writeFile(name, content, cb);
    }, writeTimeout);
};

describe("API: .watch() - Public watch method", function() {
    it("Should allow arbitrary watchers with callback fn + no options when not connected to running instance", function(done) {
        browserSync.reset();

        var tempFile = path.join(outpath, "watch-func.txt");
        var bs = browserSync.create("test");

        fs.writeFile(tempFile, tempFileContent, function() {
            var watcher = bs.watch(tempFile, function(event, file) {
                assert.equal(event, "add");
                assert.equal(file, tempFile);
                watcher.close();
                done();
            });

            writeFileWait(tempFile, tempFileContent + " changed");
        });
    });

    it("Should allow arbitrary watchers with callback fn when not connected to running instance", function(done) {
        browserSync.reset();

        var tempFile = path.join(outpath, "watch-func.txt");
        var bs = browserSync.create("test");

        fs.writeFile(tempFile, tempFileContent, function() {
            var watcher = bs.watch(tempFile, { ignoreInitial: true }, function(
                event,
                file
            ) {
                assert.equal(event, "change");
                assert.equal(file, tempFile);
                watcher.close();
                done();
            });

            writeFileWait(tempFile, tempFileContent + " changed");
        });
    });

    it("Should allow arbitrary watchers with event emitter fn when not connected to running instance", function(done) {
        browserSync.reset();

        var tempFile = path.join(outpath, "watch-func.txt");
        var bs = browserSync.create("test");

        fs.writeFile(tempFile, tempFileContent, function() {
            var watcher = bs
                .watch(tempFile, { ignoreInitial: true })
                .on("change", function(file) {
                    assert.equal(file, tempFile);
                    watcher.close();
                    done();
                });

            writeFileWait(tempFile, tempFileContent + " changed");
        });
    });
});
