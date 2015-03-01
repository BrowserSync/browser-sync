"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Retrieving options via API", function () {

    it("has access to options", function (done) {

        browserSync.reset();

        var instance;

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        browserSync.use({

            plugin: function (opts, bs) {

                assert.ok(require("immutable").Map.isMap(bs.getOptions()));
                instance.cleanup();
                done();
            },
            "plugin:name": "test"
        });

        instance = browserSync(config).instance;
    });
});
