"use strict";

var browserSync = require("../../../");

var sinon   = require("sinon");
var assert  = require("chai").assert;

describe("E2E server test with multiple instances", function () {

    this.timeout(5000);

    var bs, bs2, plugin1spy, plugin2spy;

    before(function (done) {

        browserSync.reset();

        var config = {
            online: false,
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        plugin1spy = sinon.spy();
        plugin2spy = sinon.spy();

        bs = browserSync.create("first");
        bs.use({
            plugin: function (opts) {
                assert.equal(opts.plugin, "1");
                plugin1spy();
            }
        }, {plugin: "1"});

        bs2 = browserSync.create("second");
        bs2.use({
            plugin: function (opts) {
                assert.equal(opts.plugin, "2");
                plugin2spy();
            }
        }, {plugin: "2"});

        bs.init(config, function () {
            bs2.init(config, done);
        });
    });

    after(function () {
        browserSync.get("first").cleanup();
        browserSync.get("second").cleanup();
    });

    it("uses only plugins registered to each instance", function () {
        sinon.assert.calledOnce(plugin1spy);
        sinon.assert.calledOnce(plugin2spy);
    });
});
