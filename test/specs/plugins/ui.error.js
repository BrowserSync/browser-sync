"use strict";

var browserSync = require("../../../");
var assert      = require("chai").assert;

describe("Plugins: User interface with error on init", function () {

    var instance;

    before(function (done) {

        browserSync.reset();
        browserSync.use({
            "plugin:name": "UI",
            "plugin": function (opts, bs, cb) {
                cb(new Error("Could not start"));
            }
        });

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should start even when UI errors", function () {
        assert.isUndefined(instance.ui);
    });
});
