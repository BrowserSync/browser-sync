"use strict";

var utils    = require("../../../lib/utils").utils;

var assert   = require("chai").assert;

var external = "192.168.0.4";
var port = 3002;

describe("creating URLs", function () {
    var options;
    beforeEach(function(){
        options = {
            startPath: false
        };
    });
    it("should return an object with local + remote", function () {
        var actual   = utils.getUrls(external, port, options);
        var expected = {
            local: "http://localhost:3002",
            remote: "http://192.168.0.4:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + remote (2)", function () {
        var actual   = utils.getUrls("10.33.233.3", port, options);
        var expected = {
            local: "http://localhost:3002",
            remote: "http://10.33.233.3:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + remote with paths", function () {
        options.startPath = "app"
        var actual   = utils.getUrls("10.33.233.3", port, options);
        var expected = {
            local: "http://localhost:3002/app",
            remote: "http://10.33.233.3:3002/app"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + remote with paths & Params", function () {
        options.startPath = "app/home?rel=123"
        var actual   = utils.getUrls("10.33.233.3", port, options);
        var expected = {
            local: "http://localhost:3002/app/home?rel=123",
            remote: "http://10.33.233.3:3002/app/home?rel=123"
        };
        assert.deepEqual(actual, expected);
    });
});