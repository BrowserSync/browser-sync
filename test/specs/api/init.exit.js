"use strict";

var browserSync = require("../../../index");

var assert      = require("chai").assert;
var sinon       = require("sinon");

describe("Using the public exit method", function () {

    it("should exit without BS being started", function () {
        var stub = sinon.stub(process, "exit");
        browserSync.exit();
        sinon.assert.calledOnce(stub);
        stub.restore();
    });

    describe("should exit when BS is running.", function () {

        var instance;

        before(function (done) {

            var config = {
                debugInfo: false,
                open: false
            };

            instance = browserSync(config, done);
        });

        after(function () {
            instance.cleanup();
        });

        it("should know the active State of BrowserSync", function () {

            var stub = sinon.stub(process, "exit");

            assert.equal(browserSync.active, true);

            browserSync.exit();

            assert.equal(browserSync.active, false);

            stub.restore();
        });
    });
});