"use strict";

var options         = require("../../../lib/cli/cli-options");
var merge           = options.merge;

var assert = require("chai").assert;

describe("CLI: Options: Merging Ports option", function () {
    it("should return the ports object with given ports", function () {
        var imm = merge({ports:
            "3001,3005"
        });
        assert.deepEqual(imm.get("ports").toJS(), {
            min: 3001,
            max: 3005
        });
    });
    it("should return the ports object with single port given", function () {
        var imm = merge({ports:
            "3001"
        });
        assert.deepEqual(imm.get("ports").toJS(), {
            min: 3001,
            max: null
        });
    });
    it("should return the ports object with given object", function () {
        var imm = merge({
            ports: {
                min: 4000
            }
        });
        assert.deepEqual(imm.get("ports").toJS(), {
            min: 4000,
            max: null
        });
    });
    it("should return the ports object with given object", function () {
        var imm = merge({
            ports: {
                min: 4000,
                max: 5000
            }
        });
        assert.deepEqual(imm.get("ports").toJS(), {
            min: 4000,
            max: 5000
        });
    });
});
