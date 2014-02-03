"use strict";

var index = require("../../lib/index");
var dConfig = require("../fixtures/config/si-default-config");
var _ = require("lodash");
var assert = require("chai").assert;
var setup = index.setup;

var defaultConfig;

describe("Browser-sync: using a proxy from command-line", function () {

    beforeEach(function(){
        defaultConfig = _.cloneDeep(dConfig);
    });

    it("can load", function () {
        assert.isDefined(setup);
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
            assert.equal(config.proxy.host, "192.168.0.4");
            assert.equal(config.proxy.port, "8000");
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
            assert.equal(config.proxy.host, "192.168.0.4");
            assert.equal(config.proxy.port, "8000");
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
            assert.equal(config.proxy.host, "192.168.0.4");
            assert.equal(config.proxy.port, "8000");
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
            assert.equal(config.proxy.host, "local.dev.com");
        });
    });
    describe("accepting a full url with protocol", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "http://local.dev.com"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "local.dev.com");
        });
    });
    describe("accepting a full url with protocol + port", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "http://local.dev.com:3000"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "local.dev.com");
            assert.equal(config.proxy.port, "3000");
        });
    });
    describe("accepting a full url with protocol + port + trailing slash", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "http://local.dev.com:3000/"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "local.dev.com");
            assert.equal(config.proxy.port, "3000");
        });
    });
    describe("accepting a url with www", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "www.bbc.co.uk"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "bbc.co.uk");
        });
    });
    describe("Excluding paths", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "http://bbc.co.uk/this/sub-path"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "bbc.co.uk");
        });
    });
    describe("Excluding trailing slashes", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "http://0.0.0.0:8000/"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should use given port", function () {
            assert.equal(config.proxy.host, "0.0.0.0");
            assert.equal(config.proxy.port, "8000");
        });
    });
    describe("Excluding trailing slashes", function () {
        var config;
        beforeEach(function () {
            var argv = {
                proxy: "web"
            };
            config = setup.getConfig(defaultConfig, argv);
        });
        it("should default to port 80", function () {
            assert.equal(config.proxy.host, "web");
        });
    });
});