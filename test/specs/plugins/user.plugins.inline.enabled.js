"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Setting the default state (false) if given in options", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module:  "bs-snippet-injector",
                    options: {
                        enabled: false,
                        file:    ""
                    }
                }
            ]
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should auto disable a plugin when options given", function (done) {
        assert.equal(instance.getUserPlugins().length, 1);
        assert.isFalse(instance.getUserPlugins()[0].active);
        done();
    });
});

describe("Plugins: Setting the default state (true) if given in options", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: "bs-snippet-injector",
                    options: {
                        enabled: true
                    }
                }
            ]
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should auto disable a plugin when options given", function (done) {
        assert.equal(instance.getUserPlugins().length, 1);
        assert.isTrue(instance.getUserPlugins()[0].active);
        done();
    });
});
