"use strict";

var index = require("../../../lib/index");
var dConfig = require("../../fixtures/config/si-default-config");
var _ = require("lodash");
var assert = require("chai").assert;
var setup = index.setup;

var defaultConfig;

describe("Accepting a PORTS arg on command line", function () {

    beforeEach(function(){
        // reset default config before every test
        defaultConfig = _.cloneDeep(dConfig);
    });


    describe("When a ports arg is given on command line", function () {

        it("should return the options object with given ports", function () {

            var argv = {
                ports: "3001, 3005"
            };

            var config = setup.getConfig(defaultConfig, argv);

            assert.deepEqual(config.ports.min, 3001);
            assert.deepEqual(config.ports.max, 3005);
        });
        it("should return the options object with given ports (2)", function () {

            var argv = {
                ports: "3100, 3200"
            };
            var config = setup.getConfig(defaultConfig, argv);
            var actual = config.ports;

            assert.deepEqual(actual.min, 3100);
            assert.deepEqual(actual.max, 3200);
        });
        it("should return the only the mix if MAX not given", function () {

            var argv = {
                ports: "3100"
            };
            var config = setup.getConfig(defaultConfig, argv);
            var actual = config.ports;

            assert.deepEqual(actual.min, 3100);
        });
        it("should return only the min if given as a Number & MAX not given", function () {

            var argv = {
                ports: 3100
            };
            var config = setup.getConfig(defaultConfig, argv);
            var actual = config.ports;

            assert.deepEqual(actual.min, 3100);
        });
        it("should set the max to NULL if not given ", function () {

            var argv = {
                ports: "3100"
            };
            var config = setup.getConfig(defaultConfig, argv);
            var actual = config.ports;

            assert.equal(actual.max, null);
        });
    });
});
