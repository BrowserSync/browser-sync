"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E Events test", function () {

    var options;
    var instance, server;

    before(function (done) {

        browserSync.init([], {open: false, logLevel: "silent"}, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });

    after(function () {
        instance.cleanup();
    });

    it("Should register internal events", function () {

        var spy = sinon.spy(instance.io.sockets, "emit");
        instance.events.emit("file:reload", {path: "somepath.css"});
        sinon.assert.calledOnce(spy);
        spy.restore();
    });
});
