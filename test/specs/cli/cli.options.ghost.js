"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli");
var options         = cli.options;
var callbacks       = options.callbacks;

var assert = require("chai").assert;

describe("Merging Ghostmode options", function () {
    it("should merge ghost mode set to false", function () {
        var arg = false;
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.deepEqual(actual, arg);
    });
    it("should merge ghost mode set to false as string", function () {
        var arg = "false";
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.equal(actual, false);
    });
    it("should allow FORMS shortcuts", function () {

        var arg = {forms: false};
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);

        assert.deepEqual(actual.forms.submit,  false);
        assert.deepEqual(actual.forms.inputs,  false);
        assert.deepEqual(actual.forms.toggles, false);
    });
    it("should allow FORMS shortcuts (2)", function () {

        var arg = {forms: true};
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);

        assert.deepEqual(actual.forms.submit,  true);
        assert.deepEqual(actual.forms.inputs,  true);
        assert.deepEqual(actual.forms.toggles, true);
    });
    it("should allow FORMS shortcuts (3)", function () {

        var arg = true;
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);

        assert.deepEqual(actual.clicks, true);
        assert.deepEqual(actual.scroll, true);
        assert.deepEqual(actual.forms.submit, true);
        assert.deepEqual(actual.forms.inputs, true);
        assert.deepEqual(actual.forms.toggles, true);
        assert.deepEqual(actual.location, true);
    });
    it("should merge ghost mode option when certain options disabled", function () {
        var arg = {
            links: true
        };
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.equal(actual.clicks, true);
        assert.equal(actual.links, true);
    });
});
