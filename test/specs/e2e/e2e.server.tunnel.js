"use strict";

var browserSync   = require("../../../lib/index");
var tunnel        = require("../../../lib/tunnel");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with tunnel", function () {

    var options;
    var instance;
    var server;
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

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;
            sinon.assert.calledOnce(stub);
            done();
        });
    });
    after(function () {
        stub.reset();
        instance.cleanup();
    });
});
