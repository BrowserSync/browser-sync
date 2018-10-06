var assert = require("chai").assert;
var hook = require("../../../dist/hooks")["files:watch"];
var merge = require("../../../dist/cli/cli-options").merge;
var browserSync = require("../../../");

describe("files:watch hook", function() {
    it("should accept initial as List", function() {
        var [imm] = merge({
            files: "*.html"
        });
        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            core: {
                globs: ["*.html"],
                objs: []
            }
        });
    });
    it("should accept initial as List", function() {
        var [imm] = merge({
            files: ["*.html"]
        });

        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            core: {
                globs: ["*.html"],
                objs: []
            }
        });
    });
    it("should accept & merge initial as List + Plugin options", function() {
        var [imm] = merge({
            files: "*.html"
        });

        var pluginOptions = {
            plugin1: {
                files: "*.hbs"
            }
        };

        var files = imm.get("files");

        assert.deepEqual(hook([], files, pluginOptions).toJS(), {
            core: {
                globs: ["*.html"],
                objs: []
            },
            plugin1: {
                globs: ["*.hbs"],
                objs: []
            }
        });
    });
    it("should accept both string globs + objects as file watching patterns", function() {
        var cb = function(event, file) {
            console.log(file);
        };

        var [imm] = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        assert.equal(imm.get("files").toJS().core.globs[0], "*.html");
        assert.equal(imm.get("files").toJS().core.objs[0].match, "*.css");
    });
    it("should string globs + objects as file watching patterns 1", function() {
        var cb = function(event, file) {
            console.log(file);
        };

        var [imm] = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            plugin1: {
                files: "*.hbs"
            }
        };

        var out = hook([], imm.get("files"), pluginOptions).toJS();

        assert.equal(out.core.globs.length, 1);
        assert.equal(out.core.objs.length, 1);
        assert.equal(out.plugin1.globs.length, 1);
        assert.equal(out.plugin1.objs.length, 0);

        assert.equal(out.core.globs[0], "*.html");
        assert.equal(out.core.objs[0].match, "*.css");

        assert.equal(out.plugin1.globs[0], "*.hbs");
    });
    it("should string globs + objects as file watching patterns 2", function() {
        var cb = function(event, file) {
            console.log(file);
        };

        var [imm] = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            plugin1: {
                files: [
                    "*.hbs",
                    {
                        match: "*.css",
                        fn: cb
                    }
                ]
            }
        };

        var out = hook([], imm.get("files"), pluginOptions).toJS();

        assert.equal(out.core.globs.length, 1);
        assert.equal(out.core.objs.length, 1);
        assert.equal(out.plugin1.globs.length, 1);
        assert.equal(out.plugin1.objs.length, 1);

        assert.equal(out.core.globs[0], "*.html");
        assert.equal(out.core.objs[0].match, "*.css");

        assert.equal(out.plugin1.globs[0], "*.hbs");
        assert.equal(out.plugin1.objs[0].fn, cb);
    });

    it("should string globs + objects as file watching patterns 3", function(done) {
        browserSync.reset();
        browserSync.create().init(
            {
                online: false,
                logLevel: "silent",
                files: [
                    "*.html",
                    {
                        match: "*.css",
                        fn: function() {}
                    }
                ],
                plugins: [
                    {
                        module: {
                            plugin: function() {},
                            "plugin:name": "plugin1"
                        },
                        options: {
                            files: [
                                "*.hbs",
                                {
                                    match: "*.less",
                                    fn: function() {}
                                }
                            ]
                        }
                    }
                ]
            },
            function(err, bs) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal(bs.watchers.core.watchers.length, 2);
                assert.equal(bs.watchers.plugin1.watchers.length, 2);
                bs.cleanup();
                done();
            }
        );
    });
    it("should string multi globs + objects as file watching patterns", function(done) {
        var cb = function() {};
        browserSync.reset();
        browserSync.create().init(
            {
                online: false,
                logLevel: "silent",
                files: [
                    "*.hbs",
                    "*.jade",
                    {
                        match: ["*.html"],
                        fn: cb
                    },
                    {
                        match: ["*.css"],
                        fn: cb
                    }
                ],
                plugins: [
                    {
                        module: {
                            plugin: function() {},
                            "plugin:name": "plugin1"
                        },
                        options: {
                            files: [
                                "*.hbs",
                                {
                                    match: "!*.less",
                                    fn: cb
                                }
                            ]
                        }
                    },
                    {
                        module: {
                            plugin: function() {},
                            "plugin:name": "plugin2"
                        },
                        options: {
                            files: [
                                "*.hbs",
                                {
                                    match: "*.less",
                                    fn: cb
                                }
                            ]
                        }
                    }
                ]
            },
            function(err, bs) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.equal(3, bs.watchers.core.watchers.length);
                assert.equal(2, bs.watchers.plugin1.watchers.length);
                assert.equal(2, bs.watchers.plugin2.watchers.length);
                bs.cleanup();
                done();
            }
        );
    });

    it("should accept objs only as main option", function(done) {
        var cb = function() {};
        browserSync.reset();
        browserSync.create().init(
            {
                online: false,
                logLevel: "silent",
                files: [
                    {
                        match: ["*.html"],
                        fn: cb
                    }
                ]
            },
            function(err, bs) {
                assert.equal(1, bs.watchers.core.watchers.length);
                bs.cleanup();
                done();
            }
        );
    });

    it("should accept objs only as plugin options only", function(done) {
        var cb = function() {};
        browserSync.reset();
        browserSync.create().init(
            {
                online: false,
                logLevel: "silent",
                plugins: [
                    {
                        module: {
                            plugin: function() {},
                            "plugin:name": "plugin1"
                        },
                        options: {
                            files: [
                                {
                                    match: "!*.less",
                                    fn: cb
                                }
                            ]
                        }
                    }
                ]
            },
            function(err, bs) {
                assert.equal(1, bs.watchers.plugin1.watchers.length);
                bs.cleanup();
                done();
            }
        );
    });

    it("should accept globs only as plugin options only", function(done) {
        var cb = function() {};
        browserSync.reset();
        browserSync.create().init(
            {
                online: false,
                logLevel: "silent",
                files: "*.html",
                plugins: [
                    {
                        module: {
                            plugin: function() {},
                            "plugin:name": "plugin1"
                        },
                        options: {
                            files: [
                                "*.html",
                                "*.css",
                                {
                                    match: "*.jade",
                                    fn: cb
                                }
                            ]
                        }
                    }
                ]
            },
            function(err, bs) {
                assert.equal(2, bs.watchers.plugin1.watchers.length);
                assert.equal(1, bs.watchers.core.watchers.length);
                bs.cleanup();
                done();
            }
        );
    });
});
