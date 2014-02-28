"use strict";

var index = require("../../../lib/index");
var cliUtils = require("../../../lib/cli").utils;
var assert = require("chai").assert;
var dConfig = require("../../fixtures/config/si-default-config");
var _ = require("lodash");

var defaultConfig;

describe("When a Host arg is given on command line", function () {

    var argv = {},
        host = "local.dev.com";

    beforeEach(function(){
        argv.host     = host;
        defaultConfig = _.cloneDeep(dConfig);
    });

    it("should override the default host", function () {
        var config = cliUtils.getConfig(defaultConfig, argv);
        assert.equal(config.host, host);
    });
});