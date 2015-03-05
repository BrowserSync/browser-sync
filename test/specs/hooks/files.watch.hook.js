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
            core: ["*.html"]
        });
    });
    it("should accept initial as List", function () {
        var imm = merge({
            files: ["*.html"]
        });
        assert.deepEqual(hook([], imm.get("files")).toJS(), {
            core: ["*.html"]
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
            core:    {"*.html": true},
            plugin1: ["*.hbs"]
        });
    });
});
