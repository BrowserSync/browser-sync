"use strict";

var index = require("../../lib/index");
var setup = index.setup;
var assert = require("chai").assert;
var dConfig = require("../fixtures/si-default-config");
var _ = require("lodash");

var defaultConfig;

describe("When a Server arg is given on command line", function () {

    var argv = {};

    beforeEach(function(){
        argv.server   = true;
        defaultConfig = _.cloneDeep(dConfig);
    });

    it("should set the server option to true if given on command line", function () {
        var config = setup.getConfig(defaultConfig, argv);
        assert.ok(config.server);
    });

    it("should set the base dir if given", function () {
        argv.server = "app";

        var config   = setup.getConfig(defaultConfig, argv);
        var expected = "app";
        var actual   = config.server.baseDir;
        assert.equal(actual, expected);
    });

    it("should set the base dir as current for server if not given", function () {
        var config   = setup.getConfig(defaultConfig, argv);
        var expected = "./";
        var actual   = config.server.baseDir;
        assert.equal(actual, expected);
    });

    it("should set the index page as default if not supplied", function () {
        var config   = setup.getConfig(defaultConfig, argv);
        var expected = "index.html";
        var actual   = config.server.index;
        assert.equal(actual, expected);
    });
});