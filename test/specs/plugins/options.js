"use strict";

var browserSync = require("../../../index");
var BrowserSync = require("../../../lib/browser-sync");

var assert  = require("chai").assert;

describe("Plugins: Adding options:", function () {

    it("allows plugins to have access to options passed in '.use()'", function (done) {

        var instance;

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            debugInfo: false,
            open: false
        };

        browserSync.use({

            plugin: function (opts, bs) {
                assert.equal(opts.name, "shane");
                assert.isTrue(bs instanceof BrowserSync);
                instance.cleanup();
                done();
            },
            "plugin:name": "test"

        }, {name: "shane"});

        instance = browserSync(config);
    });
});
