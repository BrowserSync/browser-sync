var path = require("path");
var assert = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI UI test", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    server: true,
                    open: false,
                    uiPort: 2000
                }
            },
            cb: function(err, bs) {
                if (err) {
                    return done(err);
                }
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("serves versioned browser-sync client js", function() {
        assert.equal(instance.options.getIn(["ui", "port"]), 2000);
    });
});
