"use strict";

var utils         = require("../../../lib/server/utils");

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
            utils.addBaseDir(app, base, true);
            sinon.assert.calledOnce(spy);
        });
        it("Should add the static middleware with multiple middlewares", function () {
            utils.addBaseDir(app, ["app", "dist"], true);
            sinon.assert.calledTwice(spy);
        });
        it("Should add the static middleware with multiple middlewares", function () {
            utils.addBaseDir(app, ["app", "dist", "alt"], true);
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
            utils.addDirectory(app, [base, "base-2"]);
            sinon.assert.calledWithExactly(serveSpy, base);
            serveSpy.restore();
        });
    });
});
