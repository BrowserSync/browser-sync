var assert = require("chai").assert;
var sinon = require("sinon");
var browserSync = require("../../../");

describe("Plugins: Retrieving user plugins when given inline as object reference", function() {
    var instance;
    var PLUGIN_NAME_1 = "Test Plugin 1";
    var PLUGIN_NAME_2 = "Test Plugin 2";
    var spy1, spy2;

    before(function(done) {
        spy1 = sinon.spy();
        spy2 = sinon.spy();
        browserSync.reset();

        var bs = browserSync.create();

        var fake1 = {
            plugin: spy1,
            "plugin:name": PLUGIN_NAME_1
        };
        var fake2 = {
            plugin: spy1,
            "plugin:name": PLUGIN_NAME_2
        };

        var config = {
            logLevel: "silent",
            plugins: [fake1, fake2]
        };

        instance = bs.init(config, done);
    });
    after(function() {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins", function() {
        assert.equal(instance.getUserPlugins().length, 2);
    });
    it("Should have access to only the user-specified plugins", function() {
        assert.equal(instance.getUserPlugins()[0].name, PLUGIN_NAME_1);
        assert.equal(instance.getUserPlugins()[1].name, PLUGIN_NAME_2);
    });
});
