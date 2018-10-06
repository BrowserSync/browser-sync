var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("e2e options test", function() {
    it("Sets the available port", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            var match = /\d{2,5}/.exec(bs.options.get("port"))[0];
            assert.isNotNull(match);
            bs.cleanup();
            done();
        });
    });

    it("Sets the available port", function(done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            files: ["*.html"],
            ports: {
                min: 3500
            },
            logLevel: "silent",
            open: false
        };
        browserSync(config, function(err, bs) {
            var match = /\d{2,5}/.exec(bs.options.get("port"))[0];
            assert.isNotNull(match);
            assert.equal(match, 3500, "Uses the given port the available port");
            assert.deepEqual(
                bs.options.get("files").toJS(),
                {
                    core: {
                        globs: ["*.html"],
                        objs: []
                    }
                },
                "set's the files option"
            );
            bs.cleanup();
            done();
        });
    });

    it("Sets the available port", function(done) {
        browserSync.reset();
        sinon.spy(console, "log");
        browserSync([], null, function(err, bs) {
            var match = /\d{2,5}/.exec(bs.options.get("port"))[0];
            assert.isNotNull(match);
            assert.deepEqual(bs.options.get("open"), false);
            console.log.restore();
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options", function(done) {
        browserSync.reset();
        browserSync([], { logLevel: "silent" }, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();

            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options", function(done) {
        browserSync.reset();
        var config = {
            ghostMode: {
                links: true,
                forms: {
                    submit: false
                }
            },
            logLevel: "silent"
        };
        browserSync([], config, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();

            assert.deepEqual(ghostMode.links, true);
            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options in shorthand", function(done) {
        browserSync.reset();
        var config = {
            ghostMode: false,
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, false);
            assert.deepEqual(ghostMode.forms.toggles, false);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options in shorthand", function(done) {
        browserSync.reset();
        var config = {
            ghostMode: true,
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options in shorthand", function(done) {
        browserSync.reset();
        var config = {
            ghostMode: {
                forms: false
            },
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, false);
            assert.deepEqual(ghostMode.forms.toggles, false);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options in shorthand", function(done) {
        browserSync.reset();
        var config = {
            ghostMode: {
                forms: true
            },
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            var ghostMode = bs.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
            bs.cleanup();
            done();
        });
    });

    it("Sets the ghostMode options", function(done) {
        browserSync.reset();
        var config = {
            host: "localhost",
            logLevel: "silent"
        };
        browserSync(config, function(err, bs) {
            assert.ok(
                bs.options
                    .get("port")
                    .toString()
                    .match(/\d\d\d\d/)
            );
            assert.ok(bs.options.getIn(["urls", "local"]).match(/\d{4,5}$/));
            bs.cleanup();
            done();
        });
    });

    it("Sets the files option with the old API", function(done) {
        browserSync.reset();
        var config = {
            host: "localhost",
            online: false,
            logLevel: "silent"
        };

        browserSync.init(["*.html"], config, function(err, bs) {
            assert.deepEqual(bs.options.get("files").toJS(), {
                core: {
                    globs: ["*.html"],
                    objs: []
                }
            });
            bs.cleanup();
            done();
        });
    });

    it("Sets the files option with the old API", function(done) {
        browserSync.reset();
        browserSync.emitter.on("init", function() {
            assert.deepEqual(bs.options.get("files").toJS(), {
                core: {
                    globs: ["*.html"],
                    objs: []
                }
            });
            bs.cleanup();
            done();
        });
        var bs = browserSync.init(["*.html"]).instance;
    });

    it("Sets the files option with the old API", function(done) {
        browserSync.reset();
        browserSync.emitter.on("init", function() {
            assert.deepEqual(bs.options.get("files").toJS(), {
                core: {
                    globs: ["*.html"],
                    objs: []
                }
            });
            bs.cleanup();
            done();
        });
        var bs = browserSync.init(["*.html"], {}).instance;
    });
});
