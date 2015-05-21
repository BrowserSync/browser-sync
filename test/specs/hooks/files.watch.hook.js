"use strict";

var assert = require("chai").assert;
var hook = require("../../../lib/hooks")["files:watch"];
var merge = require("../../../lib/cli/cli-options").merge;

describe("files:watch hook", function () {
    it("should accept initial as List", function () {
        var imm = merge({
            files: "*.html"
        });
        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            "core": {
                "globs": [
                    "*.html"
                ],
                "objs": []
            }
        });
    });
    it("should accept initial as List", function () {
        var imm = merge({
            files: ["*.html"]
        });

        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            "core": {
                "globs": [
                    "*.html"
                ],
                "objs": []
            }
        });
    });
    it("should accept & merge initial as List + Plugin options", function () {

        var imm = merge({
            files: "*.html"
        });

        var pluginOptions = {
            "plugin1": {
                files: "*.hbs"
            }
        };

        var files = imm.get("files");

        assert.deepEqual(hook([], files, pluginOptions).toJS(), {
            "core": {
                "globs": [
                    "*.html"
                ],
                "objs": []
            },
            "plugin1": {
                "globs": [
                    "*.hbs"
                ],
                "objs": []
            }
        });
    });
    it("should accept both string globs + objects as file watching patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
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
    it("should string globs + objects as file watching patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            "plugin1": {
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
    it("should string globs + objects as file watching patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            "plugin1": {
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

    it("should string globs + objects as file watching patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
            files: [
                "*.html",
                {
                    match: "*.css",
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            "plugin1": {
                files: [
                    "*.hbs",
                    {
                        match: "*.less",
                        fn: cb
                    }
                ]
            }
        };

        var out = hook([], imm.get("files"), pluginOptions);
        imm = imm.set("files", out);

        var watchers = require("../../../lib/file-watcher").plugin({options: imm});
        assert.equal(watchers.core.watchers.length, 2);
        assert.equal(watchers.plugin1.watchers.length, 2);
    });
    it("should string multi globs + objects as file watching patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
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
            ]
        });

        var pluginOptions = {
            "plugin1": {
                files: [
                    "*.hbs",
                    {
                        match: "!*.less",
                        fn: cb
                    }
                ]
            },
            "plugin2": {
                files: [
                    "*.hbs",
                    {
                        match: "*.less",
                        fn: cb
                    }
                ]
            },

        };

        var out = hook([], imm.get("files"), pluginOptions);

        imm = imm.set("files", out);

        var watchers = require("../../../lib/file-watcher").plugin({options: imm});

        assert.equal(3, watchers.core.watchers.length);
        assert.equal(2, watchers.plugin1.watchers.length);
        assert.equal(2, watchers.plugin2.watchers.length);
    });

    it("should accept objs only as main option", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
            files: [
                {
                    match: ["*.html"],
                    fn: cb
                }
            ]
        });

        var pluginOptions = {};

        //console.log(imm.get("files"));

        var out = hook([], imm.get("files"), pluginOptions);

        imm = imm.set("files", out);

        var watchers = require("../../../lib/file-watcher").plugin({options: imm});

        assert.equal(1, watchers.core.watchers.length);
    });

    it("should accept objs only as plugin options only", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({});

        var pluginOptions = {
            "plugin1": {
                files: [
                    {
                        match: "!*.less",
                        fn: cb
                    }
                ]
            }
        };

        var out = hook([], imm.get("files"), pluginOptions);

        imm = imm.set("files", out);

        var watchers = require("../../../lib/file-watcher").plugin({options: imm});

        assert.equal(1, watchers.plugin1.watchers.length);
    });

    it("should accept globs only as plugin options only", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({files: "*.html"});

        var pluginOptions = {
            "plugin1": {
                files: [
                    "*.html",
                    "*.css",
                    {
                        match: "*.jade",
                        fn: cb
                    }
                ]
            }
        };

        var out = hook([], imm.get("files"), pluginOptions);

        imm = imm.set("files", out);

        var watchers = require("../../../lib/file-watcher").plugin({options: imm});

        assert.equal(2, watchers.plugin1.watchers.length);
        assert.equal(1, watchers.core.watchers.length);
    });
});
