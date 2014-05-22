"use strict";

var defaultConfig   = require("../../../lib/default-config");
var options             = require("../../../lib/cli-options");

var assert = require("chai").assert;
var _      = require("lodash");

var defaultsClone = _.cloneDeep(defaultConfig);

describe("Merging Ports option", function () {
    var defaultValue;
    beforeEach(function () {
        defaultValue = false;
    });
    it("should return the ports object with given ports", function () {
        var arg = "3001,3005";
        var actual = options._mergePortsOption(defaultsClone, arg);
        var expected = {
            min: 3001,
            max: 3005
        };
        assert.deepEqual(actual, expected);
    });
    it("should return the ports object with given ports", function () {
        var arg = "3001";
        var actual = options._mergePortsOption(defaultsClone, arg);
        var expected = {
            min: 3001,
            max: null
        };
        assert.deepEqual(actual, expected);
    });
    it("should return the ports object with given object", function () {
        var arg = {
            min: 4000
        };
        var actual = options._mergePortsOption(defaultsClone, arg);
        var expected = {
            min: 4000,
            max: null
        };
        assert.deepEqual(actual, expected);
    });
    it("should return the ports object with given object", function () {
        var arg = {
            min: 4000,
            max: 5000
        };
        var actual = options._mergePortsOption(defaultsClone, arg);
        var expected = {
            min: 4000,
            max: 5000
        };
        assert.deepEqual(actual, expected);
    });
});
