"use strict";

var browserSync   = require("../../../index");
var tunnel        = require("../../../lib/tunnel");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with tunnel", function () {

    var instance;
    var stub;

    before(function (done) {

        stub = sinon.stub(tunnel, "init");

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            debugInfo: false,
            open: false,
            tunnel: true,
            online: true
        };

        instance = browserSync.init([], config, done);
    });

    after(function () {
        stub.reset();
        instance.cleanup();
    });

    it("should call init on the tunnel", function () {
        sinon.assert.calledOnce(stub);
    });
});
