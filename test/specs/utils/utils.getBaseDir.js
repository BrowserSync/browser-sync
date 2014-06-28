//"use strict";
//
//var utils  = require("../../../lib/utils").utils;
//var assert = require("chai").assert;
//var sinon  = require("sinon");
//
//describe("getting a display-able base DIR for server", function () {
//
//    var cwd = process.cwd();
//
//    it("is correct when using ./ ", function () {
//        var actual = utils.getBaseDir("./");
//        assert.equal(actual, cwd);
//    });
//    it("is correct when using only a dot", function () {
//        var actual = utils.getBaseDir(".");
//        assert.equal(actual, cwd);
//    });
//    it("does not throw if no value is passed", function () {
//        assert.doesNotThrow(function () {
//            utils.getBaseDir();
//        });
//    });
//    it("is correct when using no param", function () {
//        var actual = utils.getBaseDir();
//        assert.equal(actual, cwd);
//    });
//    it("is correct when using a path", function () {
//        var actual = utils.getBaseDir("/app");
//        var expected = cwd + "/app";
//        assert.equal(actual, expected);
//    });
//    it("is correct when using only a forward slash", function () {
//        var actual = utils.getBaseDir("/");
//        assert.equal(actual, cwd);
//    });
//});