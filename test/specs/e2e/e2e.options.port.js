"use strict";

var browserSync = require("../../../index");
var utils = require("../../../lib/utils");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("E2E `port` option", function () {

    it("Calls cb with Error if port detection errors", function (done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server:   "test/fixtures",
            online:   false,
            open:     false
        };
        sinon.stub(utils, "getPorts").yields(new Error("Some error about a port"));
        sinon.stub(utils, "fail", function (override, errMessage, cb) {
            assert.instanceOf(errMessage, Error);
            utils.getPorts.restore();
            utils.fail.restore();
            cb();
        });
        browserSync(config, function () {
            done();
        });
    });
});
