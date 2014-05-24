"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;
var client  = require("socket.io-client");

describe("E2E Events test", function () {

    var options;
    var instance;

    before(function (done) {
        browserSync.use("logger", function () {
            return function () {};
        });
        browserSync.init([], {open: false}, function (err, bs) {
            options  = bs.options;
            instance = bs;
            done();
        });
    });

    it("Should register internal events", function () {

        var spy = sinon.spy(instance.io.sockets, "emit");
        instance.events.emit("file:reload", {path: "somepath.css"});
        sinon.assert.calledOnce(spy);
        spy.restore();
    });
});
