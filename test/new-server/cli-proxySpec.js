'use strict';

var module = require('../../lib/index');
var dConfig = require('../fixtures/si-default-config');
var _ = require('lodash');
var setup = module.setup;

var defaultConfig;

describe("Browser-sync: using a proxy from command-line", function () {

    beforeEach(function(){
        defaultConfig = _.cloneDeep(dConfig);
    });
    it("can load", function () {
        expect(setup).toBeDefined();
    });

    describe("accepting separate proxy options", function () {

        var config;
        beforeEach(function () {
            var argv = {
                proxy: {
                    host: "192.168.0.4",
                    port: "8000"
                }
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should merge proxy options", function () {
            expect(config.proxy.host).toBe("192.168.0.4");
            expect(config.proxy.port).toBe("8000");
        });
    });
    describe("accepting host+port as a single option with : delim", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "192.168.0.4:8000"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should merge proxy options", function () {
            expect(config.proxy.host).toBe("192.168.0.4");
            expect(config.proxy.port).toBe("8000");
        });
    });
    describe("accepting host+port as a single option with comma delim", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "192.168.0.4,8000"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should merge proxy options", function () {
            expect(config.proxy.host).toBe("192.168.0.4");
            expect(config.proxy.port).toBe("8000");
        });
    });
    describe("accepting only a host", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "local.dev.com"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            expect(config.proxy.host).toBe("local.dev.com");
            expect(config.proxy.port).toBe("80");
        });
    });
});