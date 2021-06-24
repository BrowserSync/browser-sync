var browserSync = require("../../../");

var assert = require("chai").assert;
var request = require("supertest");

describe("E2E snippet ignore paths test (1)", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            snippetOptions: {
                ignorePaths: "iframe.html" //back-compat
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("does not inject the snippet when excluded path hit", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.notInclude(res.text, instance.options.get("snippet"));
                done();
            });
    });
});
describe("E2E snippet blacklist paths test (1)", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            snippetOptions: {
                blacklist: ["/iframe.html"] // correct syntax
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("does not inject the snippet when excluded path hit", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.notInclude(res.text, instance.options.get("snippet"));
                done();
            });
    });
});
describe("E2E snippet blacklist paths test (1)", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            snippetOptions: {
                whitelist: ["/iframe.html"] // correct syntax
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("Always injects snippet when path matches in whitelist", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });
});
describe("E2E snippet custom regex", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            snippetOptions: {
                rule: {
                    match: /<head[^>]*>/i,
                    fn: function(snippet, match) {
                        return match + snippet;
                    }
                }
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("uses a user-provided regex", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(
                    res.text,
                    "<head>" + instance.options.get("snippet")
                );
                done();
            });
    });
});
describe("E2E snippet: false", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            snippet: false,
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("does not add the snippet when snippet: false", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                if (res.text.indexOf("__bs_script__") > -1) {
                    return done(new Error("snippet present when it shouldn't be"));
                }
                done();
            });
    });
});

describe("E2E snippet: true", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            snippet: true,
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("does not add the snippet when snippet: false", function(done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                if (res.text.indexOf("__bs_script__") === -1) {
                    return done(new Error("snippet absent when it shouldn't be"));
                }
                done();
            });
    });
});
