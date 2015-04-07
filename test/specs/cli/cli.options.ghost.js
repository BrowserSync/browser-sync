"use strict";

var cli             = require("../../../lib/cli/cli-options");
var merge           = cli.merge;

var assert = require("chai").assert;

describe("CLI: Options: Merging Ghostmode options", function () {
    it("should merge ghost mode set to false from cli", function () {
        var imm = merge({
            ghostMode: {
                clicks: false
            }
        });
        assert.isFalse(imm.getIn(["ghostMode", "clicks"]));
        assert.isTrue(imm.getIn(["ghostMode", "scroll"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
    it("should merge nested ghost mode prop", function () {
        var imm = merge({
            ghostMode: {
                forms: {
                    submit: false
                }
            }
        });
        assert.isTrue(imm.getIn(["ghostMode", "clicks"]));
        assert.isTrue(imm.getIn(["ghostMode", "scroll"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
    it("should merge ghost mode set to false", function () {
        var imm = merge({
            ghostMode: false
        });
        assert.isFalse(imm.getIn(["ghostMode", "clicks"]));
        assert.isFalse(imm.getIn(["ghostMode", "scroll"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
    it("should merge ghost mode set to true", function () {
        var imm = merge({
            ghostMode: true
        });
        assert.isTrue(imm.getIn(["ghostMode", "clicks"]));
        assert.isTrue(imm.getIn(["ghostMode", "scroll"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
    it("should merge ghost mode forms set to false", function () {
        var imm = merge({
            ghostMode: {
                forms: false
            }
        });
        assert.isTrue(imm.getIn(["ghostMode", "clicks"]));
        assert.isTrue(imm.getIn(["ghostMode", "scroll"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isFalse(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
    it("should merge ghost mode forms set to true", function () {
        var imm = merge({
            ghostMode: {
                forms: true
            }
        });
        assert.isTrue(imm.getIn(["ghostMode", "clicks"]));
        assert.isTrue(imm.getIn(["ghostMode", "scroll"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "submit"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "inputs"]));
        assert.isTrue(imm.getIn(["ghostMode", "forms", "toggles"]));
    });
});
