"use strict";

var utils         = require("../../../lib/server/utils");
var Immutable     = require("immutable");
var sinon         = require("sinon");

describe("Server: Server Utils: ", function () {

    var app;
    var spy;

    before(function () {
        spy = sinon.spy();
        app = {
            use: spy
        };
    });
    afterEach(function () {
        spy.reset();
    });

    describe("The server utils: addBaseDir", function () {
        var base;
        beforeEach(function () {
            base = "app";
        });
        it("Should add the static middleware", function () {
            utils.addBaseDir(app, base, Immutable.Map());
            sinon.assert.calledOnce(spy);
        });
        it("Should add the static middleware with multiple middlewares", function () {
            utils.addBaseDir(app, Immutable.List(["app", "dist"]), Immutable.Map());
            sinon.assert.calledTwice(spy);
        });
        it("Should add the static middleware with multiple middlewares", function () {
            utils.addBaseDir(app, Immutable.List(["app", "dist", "alt"]), Immutable.Map());
            sinon.assert.calledThrice(spy);
        });
    });

    describe("The server utils: addDirectory", function () {
        var base;
        beforeEach(function () {
            base = "app";
        });
        it("Should add the directory option to the server app", function () {
            utils.addDirectory(app, base);
            sinon.assert.called(spy);
        });
        it("Should add the directory option to the server app when array given", function () {
            var path     = require("path");
            var serveSpy = sinon.spy(path, "resolve");
            utils.addDirectory(app, Immutable.List([base, "base-2"]));
            sinon.assert.calledWithExactly(serveSpy, base);
            serveSpy.restore();
        });
    });
});
