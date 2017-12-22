var browserSync = require("../../../");

var assert = require("chai").assert;
var request = require("supertest");

describe("E2E script path test - given a callback", function() {
    it("Sets the script path", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            scriptPath: function(scriptPath) {
                return "localhost:PORT" + scriptPath;
            }
        };
        browserSync(config, function(err, bs) {
            assert.include(
                bs.options.get("snippet"),
                "localhost:PORT/browser-sync/browser-sync-client."
            );
            bs.cleanup();
            done();
        });
    });
});

describe("E2E Socket namespace test - given a string", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            socket: {
                namespace: "TEST"
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("sets the socket namespace", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "path"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(
                    res.text,
                    "___browserSync___.socketUrl = '' + location.host + '/TEST';"
                );
                done();
            });
    });
});

describe("E2E script path test - Using absolute path", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            scriptPath: function(scriptPath, port, options) {
                return options.get("absolute");
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Sets the script path", function() {
        assert.include(
            instance.options.get("snippet"),
            "http://HOST:3000/browser-sync/browser-sync-client."
        );
    });
});

describe("E2E script path test - Using absolute path + secure server", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            https: true,
            open: false,
            scriptPath: function(scriptPath, port, options) {
                return options.get("absolute");
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Sets the script path", function() {
        assert.include(
            instance.options.get("snippet"),
            "https://HOST:3000/browser-sync/browser-sync-client."
        );
    });
});
