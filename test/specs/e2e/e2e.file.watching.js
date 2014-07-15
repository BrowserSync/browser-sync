"use strict";

var browserSync   = require("../../../index");

var sinon   = require("sinon");
var fs      = require("fs");
var path    = require("path");
var assert  = require("chai").assert;

var outpath  = path.join(__dirname, "/../../fixtures");

describe("E2E Adding namespaced watchers", function () {

    var instance, file;

    before(function (done) {

        file = path.join(outpath, "watch-func.txt");

        var config = {
            files: file,
            debugInfo: false
        };

        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("Watches files with no namespace", function (done) {

        assert.ok(instance.watchers.core);
        assert.ok(instance.watchers.core.watcher);
        done();
    });
});

describe("E2E Adding namespaced watchers", function () {

    var instance, file;

    before(function (done) {

        file = path.join(outpath, "watch-func.txt");

        var config = {
            files: {
                "shane": file
            },
            debugInfo: false
        };

        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("Watches files with with a namespace", function (done) {

        assert.ok(instance.watchers.shane);
        assert.ok(instance.watchers.shane.watcher);
        done();
    });
});