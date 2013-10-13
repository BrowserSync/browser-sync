'use strict';

var module = require('../../lib/index');
var setup = module.setup;
var dConfig = require('../fixtures/si-default-config');
var _ = require('lodash');

var defaultConfig;

describe("When a Server arg is given on command line", function () {

    var argv = {};

    beforeEach(function(){

        argv.server = true;
        defaultConfig = _.cloneDeep(dConfig);
    });

    it("should set the server option to true if given on command line", function () {

        var config = setup.getConfig(defaultConfig, argv);
        expect(config.server).not.toBe(false);
    });

    it("should set the base dir as current for server if not given", function () {

        argv.ghostMode = "false";
        var config = setup.getConfig(defaultConfig, argv);
        expect(config.server.baseDir).toBe("./");


        // _todo extract to it's own test
        expect(config.ghostMode).toBe(false);

    });

    it("should set the base dir if given", function () {

        argv.server = "app";

        var config = setup.getConfig(defaultConfig, argv);
        expect(config.server.baseDir).toBe("app");
    });
});