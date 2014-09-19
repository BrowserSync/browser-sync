"use strict";

var utils    = require("../../../lib/utils");

var assert   = require("chai").assert;

var external = "192.168.0.4";
var port = 3002;

describe("Utils: creating URLs", function () {
    var options;
    beforeEach(function(){
        options = {
            startPath: false
        };
    });
    it("should return an object with local + remote", function () {
        var actual   = utils.getUrls(external, "localhost", "http", port, options);
        var expected = {
            local: "http://localhost:3002",
            external: "http://192.168.0.4:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external (2)", function () {
        var actual   = utils.getUrls("10.33.233.3", "localhost", "http", port, options);
        var expected = {
            local: "http://localhost:3002",
            external: "http://10.33.233.3:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external with paths", function () {
        options.startPath = "app";
        var actual   = utils.getUrls("10.33.233.3", "localhost", "http", port, options);
        var expected = {
            local: "http://localhost:3002/app",
            external: "http://10.33.233.3:3002/app"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external with paths & Params", function () {
        options.startPath = "app/home?rel=123";
        var actual   = utils.getUrls("10.33.233.3", "localhost", "http", port, options);
        var expected = {
            local: "http://localhost:3002/app/home?rel=123",
            external: "http://10.33.233.3:3002/app/home?rel=123"
        };
        assert.deepEqual(actual, expected);
    });
});