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
    it("sets extra port option for socket in proxy mode", function (done) {
        browserSync.reset();

        var stub = sinon.stub(utils, "getPort");

        stub.onCall(0).yields(null, 3000);
        stub.onCall(1).yields(null, 3001);

        var config = {
            logLevel: "silent",
            proxy:   "localhost",
            online:   false,
            open:     false
        };

        browserSync(config, function (err, bs) {
            bs.cleanup();
            assert.equal(bs.options.get("port"), 3000);
            assert.equal(stub.getCall(1).args[0], 3001);
            assert.equal(bs.options.getIn(["socket", "port"]), 3001);
            utils.getPort.restore();
            done();
        });
    });
    it("uses user-given extra port option for socket in proxy mode", function (done) {
        browserSync.reset();

        var stub = sinon.stub(utils, "getPort");

        stub.onCall(0).yields(null, 3000);
        stub.onCall(1).yields(null, 8001);

        var config = {
            logLevel: "silent",
            proxy:   "localhost",
            socket: {
                port: 8001
            },
            online:   false,
            open:     false
        };

        browserSync(config, function (err, bs) {
            bs.cleanup();
            assert.equal(bs.options.get("port"), 3000);
            assert.equal(stub.getCall(1).args[0], 8001);
            assert.equal(bs.options.getIn(["socket", "port"]), 8001);
            utils.getPort.restore();
            done();
        });
    });
});
