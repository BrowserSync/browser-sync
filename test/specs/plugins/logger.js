"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;
var sinon   = require("sinon");
var chalk   = require("chalk");

describe("Plugins: Getting a logger", function () {

    it("Can use a plugin-specific logger", function (done) {

        var instance;
        var PLUGIN_NAME = "HTML";

        var stub = sinon.stub(console, "log");

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({

            "plugin:name": PLUGIN_NAME,
            "plugin": function (opts, bs) {

                var logger = bs.getLogger(PLUGIN_NAME);

                logger.info("Connected!");

                stub.restore();

                var msg = chalk.stripColor(stub.getCall(0).args[0]);

                assert.equal(msg, "[BS] [HTML] Connected!");

                instance.cleanup();
                done();
            }
        }, {name: "shane"});

        instance = browserSync(config);
    });
});
