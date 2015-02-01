"use strict";

var browserSync = require("../../../");

var sinon   = require("sinon");

describe("Plugins: Allowing plugins to register cleanup tasks", function () {

    var PLUGIN_NAME = "KITTENZ";
    var instance;
    var spy;

    before(function (done) {

        browserSync.reset();
        var config = {
            logLevel: "silent",
            open: false
        };
        spy = sinon.spy();

        browserSync.use({
            plugin: function (opts, bs) {
                bs.registerCleanupTask(spy);
            },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config, done).instance;
    });
    it("Should access to only the user-specified plugins", function (done) {
        instance.cleanup();
        sinon.assert.calledOnce(spy);
        done();
    });
});
