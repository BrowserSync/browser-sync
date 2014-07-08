"use strict";

var browserSync = require("../../../lib/index");

var sinon   = require("sinon");
var _       = require("lodash");
var request = require("supertest");
var assert  = require("chai").assert;

describe("Plugin + hooks", function () {

    var instance;
    var pluginSpy;
    var initSpy;
    var mwSpy1;
    var mwSpy2;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            debugInfo: false,
            open: false
        };

        initSpy = sinon.spy();
        pluginSpy = sinon.spy(function () { return initSpy; });

        mwSpy2 = sinon.spy(function (res, req, next) {
            next();
        });
        mwSpy1 = sinon.spy(function (res, req, next) {
            next();
        });

        browserSync.use({
            plugin: pluginSpy,
            "client:events": function () {
                return function () {
                    return "cp:goto";
                };
            },
            "client:js": function () {
                return function () {
                    return "SHANE123456";
                };
            },
            "server:middleware": function () {
                return function () {
                    return [mwSpy2, mwSpy1];
                };
            }
        });

        instance = browserSync.init(config, done);
    });

    afterEach(function () {
        pluginSpy.reset();
    });

    after(function () {
        instance.cleanup();
    });

    it("calls the plugin method", function () {
        sinon.assert.calledOnce(pluginSpy); // the plugin init method
    });
    it("calls the function returned from the plugin method", function () {
        sinon.assert.calledOnce(initSpy); // the plugin init method
    });
    it("adds an item to the clientEvents array", function(){
        assert.isTrue(_.contains(instance.clientEvents, "cp:goto"));
    });
    it("adds an item to the Server Middleware array", function(){
        assert.isTrue(_.contains(instance.clientJs, "SHANE123456"));
    });
    it("adds an item to the Server Middleware array", function(done){

        request(instance.server)
            .get("/")
            .expect(200)
            .end(function () {
                sinon.assert.calledOnce(mwSpy1);
                sinon.assert.calledOnce(mwSpy2);
                done();
            });
    });
});