"use strict";

var browserSync = require("../../../index");
var messages = require("../../../lib/messages");

var assert      = require("chai").assert;
var sinon       = require("sinon");

describe("E2E script path test - given a callback", function () {

    var instance, port;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            scriptPath: function (path) {
                return path;
            }
        };
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("Sets the available port", function () {
        var script = messages.clientScript({version: instance.version});
        assert.include(instance.options.snippet, "src='"+script+"'");
    });
});