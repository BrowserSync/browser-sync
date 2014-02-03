"use strict";

var index = require("../../../lib/index");
var setup = index.setup;
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
        var config = setup.getConfig(defaultConfig, argv);
        assert.equal(config.host, host);
    });
});