"use strict";

var utils  = require("../../../lib/utils").utils;
var assert = require("chai").assert;
var sinon  = require("sinon");

describe("Utils: getting a file extension", function () {
    it("should return the file extension only (1)", function () {
        var actual = utils.getFileExtension("core.css");
        var expected = "css";
        assert.equal(actual, expected);
    });
    it("should return the file extension only (2)", function () {
        var actual = utils.getFileExtension("index.html");
        var expected = "html";
        assert.equal(actual, expected);
    });
    it("should return the file extension only (3)", function () {
        var actual = utils.getFileExtension("index.php");
        var expected = "php";
        assert.equal(actual, expected);
    });

    it("can remove the OS prefix from a filepath", function () {
        var full     = "/Users/shakyshane/sites/browser-sync/app/index.html";
        var actual   = utils.resolveRelativeFilePath(full, "/Users/shakyshane/sites/browser-sync");
        var expected = "app/index.html";
        assert.equal(actual, expected);
    });
});