"use strict";

var index       = require("../../index.js");

var assert      = require("chai").assert;
var http        = require("http");

describe("Using the file contents", function () {
    it("Returns a String", function () {
        var file = index.middleware({minify: true}, "UNIQSTRING", "file");
        assert.isString(file);
        assert.isTrue(file.indexOf("UNIQSTRING") === 0);
    });
});