var browserSync = require("../../../");
var utils = require("../../../dist/utils");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("E2E `startPath` option", function() {
    var instance;
    var stub;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            startPath: "forms.html",
            online: true
        };
        stub = sinon.stub(utils, "opnWrapper");
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the page with the startPath appended when online", function() {
        var args = stub.getCall(0).args;
        assert.include(args[0], "forms.html");
    });
});

describe("E2E `startPath` option", function() {
    var instance;
    var stub;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            startPath: "forms.html",
            online: false
        };
        stub = sinon.stub(utils, "opnWrapper");
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
        stub.restore();
    });

    it("Opens the page with the startPath appended when OFFLINE", function() {
        var args = stub.getCall(0).args;
        assert.include(args[0], "forms.html");
    });
});
