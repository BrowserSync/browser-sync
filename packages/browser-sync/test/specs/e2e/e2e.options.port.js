var browserSync = require("../../../");
var utils = require("../../../dist/utils");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("E2E `port` option", function() {
    it("Calls cb with Error if port detection errors", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            open: false
        };
        sinon
            .stub(utils, "getPorts")
            .yields(new Error("Some error about a port"));
        sinon.stub(utils, "fail", function(override, errMessage, cb) {
            assert.instanceOf(errMessage, Error);
            utils.getPorts.restore();
            utils.fail.restore();
            cb();
        });
        browserSync(config, function() {
            done();
        });
    });
    it("gets a port with host:localhost (legacy support)", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            open: false
        };
        var stub = sinon.stub(utils, "getPort");
        stub.onCall(0).yields(null, 3000);

        browserSync(config, function(err, bs) {
            utils.getPort.restore();
            bs.cleanup();
            assert.equal(stub.getCall(0).args[0], "localhost");
            done();
        });
    });
    it("gets a port with host: localhost when set via 'listen'", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            open: false,
            listen: "127.0.0.1",
            ui: {
                port: 4000
            }
        };
        var stub = sinon.stub(utils, "getPort");
        stub.onCall(0).yields(null, 3000);

        browserSync(config, function(err, bs) {
            const urls = bs.options.get("urls").toJS();
            utils.getPort.restore();
            bs.cleanup();
            assert.equal(urls.local, "http://127.0.0.1:3000");
            assert.equal(urls.ui, "http://127.0.0.1:4000");
            assert.equal(stub.getCall(0).args[0], "127.0.0.1");
            done();
        });
    });
    it("sets extra port option for socket in proxy mode (handle error)", function(done) {
        browserSync.reset();

        var stub = sinon.stub(utils, "getPort");

        stub.onCall(0).yields(null, 3000);
        stub.onCall(1).yields(new Error("Some error about ports"));

        var config = {
            logLevel: "silent",
            proxy: {
                target: "localhost",
                ws: true
            },
            online: false,
            open: false
        };

        sinon.stub(utils, "fail", function(override, errMessage, cb) {
            assert.instanceOf(errMessage, Error);
            utils.getPort.restore();
            utils.fail.restore();
            cb();
        });

        browserSync(config, function() {
            done();
        });
    });
    it("sets extra port option for socket in proxy mode", function(done) {
        browserSync.reset();

        var stub = sinon.stub(utils, "getPort");

        stub.onCall(0).yields(null, 3000);
        stub.onCall(1).yields(null, 3001);

        var config = {
            logLevel: "silent",
            proxy: {
                target: "localhost",
                ws: true
            },
            online: false,
            open: false
        };

        browserSync(config, function(err, bs) {
            bs.cleanup();
            assert.equal(bs.options.get("port"), 3000);
            assert.equal(stub.getCall(1).args[0], "localhost");
            assert.equal(stub.getCall(1).args[1], 3001);
            assert.equal(bs.options.getIn(["socket", "port"]), 3001);
            utils.getPort.restore();
            done();
        });
    });
    it("uses user-given extra port option for socket in proxy mode", function(done) {
        browserSync.reset();

        var stub = sinon.stub(utils, "getPort");

        stub.onCall(0).yields(null, 3000);
        stub.onCall(1).yields(null, 8001);

        var config = {
            logLevel: "silent",
            proxy: {
                target: "localhost",
                ws: true
            },
            socket: {
                port: 8001
            },
            online: false,
            open: false
        };

        browserSync(config, function(err, bs) {
            bs.cleanup();
            assert.equal(bs.options.get("port"), 3000);
            assert.equal(stub.getCall(1).args[1], 8001);
            assert.equal(bs.options.getIn(["socket", "port"]), 8001);
            utils.getPort.restore();
            done();
        });
    });
});
