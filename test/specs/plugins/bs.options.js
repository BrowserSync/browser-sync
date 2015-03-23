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

                assert.equal(opts.files, "*.css");
                assert.ok(require("immutable").Map.isMap(bs.getOptions()));
                instance.cleanup();
            },
            "plugin:name": "test"

        }, {files: "*.css"});

        instance = browserSync(config, function (err, bs) {
            assert.equal(bs.watchers.test.watchers.length, 1);
            done();
        }).instance;
    });
});
