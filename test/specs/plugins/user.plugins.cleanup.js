var browserSync = require("../../../");

var sinon = require("sinon");

describe("Plugins: Allowing plugins to register cleanup tasks", function() {
    it("Should access to only the user-specified plugins", function(done) {
        var PLUGIN_NAME = "KITTENZ";
        browserSync.reset();
        var config = {
            logLevel: "silent",
            open: false
        };
        var spy = sinon.spy();

        browserSync.use({
            plugin: function(opts, bs) {
                bs.registerCleanupTask(spy);
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            bs.cleanup();
            sinon.assert.calledOnce(spy);
            done();
        });
    });
});
