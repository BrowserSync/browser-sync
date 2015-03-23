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
            core: {
                "*.html": true,
                multi: []
            }
        });
    });
    it("should accept initial as List", function () {
        var imm = merge({
            files: ["*.html"]
        });
        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            core: {
                "*.html": true,
                multi: []
            }
        });
    });
    it("should accept & merge initial as List + Plugin options", function () {

        var imm = merge({
            files: {
                "*.html": true
            }
        });

        var pluginOptions = {
            "plugin1": {
                files: "*.hbs"
            }
        };

        assert.deepEqual(hook([], imm.get("files"), pluginOptions).toJS(), {
            core:    {"*.html": true, multi: []},
            plugin1: ["*.hbs"]
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

        assert.equal(imm.get("files").toJS().length, 2);
        assert.equal(imm.get("files").toJS()[0], "*.html");
        assert.equal(imm.get("files").toJS()[1].match, "*.css");
        assert.equal(imm.get("files").toJS()[1].fn, cb);

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

        assert.deepEqual(hook([], imm.get("files"), pluginOptions).toJS(), {
            core: {
                "*.html": true,
                "*.css":  cb,
                multi:    []
            },
            plugin1: ["*.hbs"]
        });
    });
    it("should string globs + objects as file watching multiple patterns", function () {

        var cb = function (event, file) {
            console.log(file);
        };

        var imm = merge({
            files: [
                "*.html",
                {
                    match: ["*.css", "*.less"],
                    fn: cb
                }
            ]
        });

        var pluginOptions = {
            "plugin1": {
                files: "*.hbs"
            }
        };

        assert.deepEqual(hook([], imm.get("files"), pluginOptions).toJS(), {
            core: {
                multi: [
                    {
                        match: ["*.css", "*.less"],
                        fn: cb
                    }
                ],
                "*.html": true
            },
            plugin1: ["*.hbs"]
        });
    });
});
