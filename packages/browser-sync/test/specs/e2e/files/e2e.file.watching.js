var browserSync = require("../../../../");

var path = require("path");
var assert = require("chai").assert;
var outpath = path.join(__dirname, "../../fixtures");

describe("file-watching (2)", function() {
    it("Watches files with no namespace", function(done) {
        browserSync.reset();

        var file = path.join(outpath, "watch-func.txt");

        var config = {
            files: file,
            logLevel: "silent"
        };

        browserSync(config, function(err, bs) {
            assert.ok(bs.watchers.core.watchers);
            assert.equal(bs.watchers.core.watchers.length, 1);
            bs.cleanup();
            done();
        });
    });

    it("Watches files when multi given", function(done) {
        browserSync.reset();

        var config = {
            files: "*.html",
            logLevel: "silent"
        };

        browserSync(config, function(err, bs) {
            assert.ok(bs.watchers.core.watchers);
            assert.ok(bs.watchers.core.watchers[0]);
            bs.cleanup();
            done();
        });
    });

    it("Watches files when multi given + objs", function(done) {
        browserSync.reset();

        var config = {
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: function(event, file) {
                        console.log(file);
                    }
                }
            ],
            logLevel: "silent"
        };

        browserSync(config, function(err, bs) {
            assert.ok(bs.watchers.core.watchers);
            assert.equal(bs.watchers.core.watchers.length, 2);
            bs.cleanup();
            done();
        });
    });
});
