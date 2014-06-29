"use strict";

var browserSync = require("../../../lib/index");

var sinon   = require("sinon");
var _       = require("lodash");
var request = require("supertest");
var assert  = require("chai").assert;

describe("Plugin hooks", function () {

    var instance;
    var spy;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            debugInfo: false,
            open: false,
            online: false
        };

        spy = sinon.spy(function () {return function () {};});

        browserSync.use("control-panel", {
            plugin: spy,
            "client:events": function () {
                return function () {
                    return "cp:goto";
                };
            },
            "client:js": function () {
                return function () {
                    return "SHANE123456";
                };
            }
        });

        instance = browserSync.init(config, done);
    });

    afterEach(function () {
        spy.reset();
    });

    after(function () {
        instance.cleanup();
    });

    it("called the plugin method", function () {
        sinon.assert.calledOnce(spy); // the plugin init method
    });
    it("adds an item to the clientEvents array", function(){
        assert.isTrue(_.contains(instance.clientEvents, "cp:goto"));
    });
    it("adds an item to the Server Middleware array", function(){
        assert.isTrue(_.contains(instance.clientJs, "SHANE123456"));
    });
});