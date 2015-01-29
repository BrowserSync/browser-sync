"use strict";

var utils  = require("../../../lib/utils");
var merge  = require("../../../lib/cli/cli-options").merge;
var assert = require("chai").assert;

describe("Utils: updating options before saving to instance", function () {
    it("should add options that can be determined at run time", function () {
        var imm = utils.updateOptions(merge({server: {baseDir: "./", https: true}}));
        assert.equal(imm.get("scheme"), "https");
    });
    it("should add options that can be determined at run time", function () {
        var imm = utils.updateOptions(merge());
        assert.equal(imm.get("scheme"), "http");
    });
});
