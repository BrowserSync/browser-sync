var utils = require("../../../dist/utils");
var assert = require("chai").assert;
var sinon = require("sinon");
var browserSync = require("../../../");

describe("E2E OPEN Browsers options (1)", function() {
    var instance;
    var stub;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            browser: "google chrome"
        };
        stub = sinon.stub(utils, "opnWrapper");
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the localhost address as default", function() {
        var args = stub.getCall(0).args;
        sinon.assert.called(stub);

        assert.equal(args[0], instance.options.getIn(["urls", "local"]));
        assert.equal(args[1], "google chrome");
    });
});

describe("E2E OPEN Browsers options (multiple)", function() {
    var instance;
    var stub;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            browser: ["google chrome", "safari"]
        };
        stub = sinon.stub(utils, "opnWrapper");
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the localhost address as default", function() {
        sinon.assert.called(stub);
        var local = instance.options.getIn(["urls", "local"]);

        var args = stub.getCall(0).args;
        assert.equal(args[0], local);
        assert.equal(args[1], "google chrome");

        args = stub.getCall(1).args;
        assert.equal(args[0], local);
        assert.equal(args[1], "safari");
    });
});

describe("E2E browser option with app args", function() {
    it("opens with object literal", function(done) {
        browserSync.reset();
        var appArg = {
            app: [
                "chromium-browser",
                "--app=http://localhost:8080",
                "--proxy-server=localhost:8080",
                "--user-data-dir=.tmp/chomium"
            ]
        };
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            browser: appArg
        };

        var stub = sinon.spy(utils, "opnWrapper");
        var opnPath = require.resolve("opn");
        require(opnPath);
        var opnStub = require("sinon")
            .stub(require.cache[opnPath], "exports")
            .returns({ catch: function() {} });

        browserSync(config, function(err, bs) {
            bs.cleanup();
            stub.restore();
            var args = opnStub.getCall(0).args;
            assert.equal(args[0], bs.options.getIn(["urls", "local"]));
            assert.deepEqual(args[1], appArg);
            require.cache[opnPath].exports.restore();
            done();
        });
    });
    it("opens with mix of string + objects", function(done) {
        browserSync.reset();
        var appArg = {
            app: [
                "chromium-browser",
                "--app=http://localhost:8080",
                "--proxy-server=localhost:8080",
                "--user-data-dir=.tmp/chomium"
            ]
        };
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            browser: [appArg, "safari", "firefox"]
        };

        var stub = sinon.spy(utils, "opnWrapper");
        var opnPath = require.resolve("opn");
        require(opnPath);
        var opnStub = require("sinon")
            .stub(require.cache[opnPath], "exports")
            .returns({ catch: function() {} });

        browserSync(config, function(err, bs) {
            bs.cleanup();
            stub.restore();
            var args1 = opnStub.getCall(0).args;
            assert.equal(args1[0], bs.options.getIn(["urls", "local"]));
            assert.deepEqual(args1[1], appArg);

            var args2 = opnStub.getCall(1).args;
            assert.deepEqual(args2[1], { app: "safari" });

            var args3 = opnStub.getCall(2).args;
            assert.deepEqual(args3[1], { app: "firefox" });

            require.cache[opnPath].exports.restore();
            done();
        });
    });
});
