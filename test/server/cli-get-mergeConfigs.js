"use strict";

var index = require("../../lib/index");
var assert = require("chai").assert;
var setup = index.setup;

describe("Merging configs", function () {
    before(function () {
    });
    after(function () {
    });
    it("can merge two configs (1)", function () {
        var options = {
            server: {
                baseDir: "./"
            }
        };
        var config   = setup.mergeConfig(options);
        var actual   = config.server.baseDir;
        var expected = "./";
        assert.equal(actual, expected);
    });
    it("can merge two configs (2)", function () {
        var options = {
            proxy: {
                host: "local.dev"
            }
        };
        var config   = setup.mergeConfig(options);
        var actual   = config.proxy.host;
        var expected = "local.dev";
        assert.equal(actual, expected);
    });
});