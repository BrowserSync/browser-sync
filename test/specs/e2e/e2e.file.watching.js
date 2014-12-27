"use strict";

var browserSync = require("../../../index");

var path = require("path");
var assert = require("chai").assert;

var outpath = path.join(__dirname, "/../../fixtures");

describe("file-watching", function () {

    describe("E2E Adding namespaced watchers", function () {

        var instance, file;

        before(function (done) {

            browserSync.reset();

            file = path.join(outpath, "watch-func.txt");

            var config = {
                files:    file,
                logLevel: "silent"
            };

            instance = browserSync(config, done).instance;
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

            browserSync.reset();

            file = path.join(outpath, "watch-func.txt");

            var config = {
                files:    {
                    "shane": file
                },
                logLevel: "silent"
            };

            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it.only("Watches files with with a namespace", function (done) {

            assert.ok(instance.watchers.shane);
            assert.ok(instance.watchers.shane.watcher);
            done();
        });
    });
});