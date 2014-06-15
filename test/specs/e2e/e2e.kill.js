"use strict";

var browserSync   = require("../../../lib/index");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E Killing the process", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            debugInfo: false,
            open: false
        };

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("returns the snippet", function () {
        var stub = sinon.stub(process, "exit");
        browserSync.exit();
        stub.restore();
        sinon.assert.calledWithExactly(stub, 0);
    });
});
