"use strict";

var browserSync = require("../../../");

var path = require("path");
var assert = require("chai").assert;

var outpath = path.join(__dirname, "../../fixtures");

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

            assert.ok(instance.watchers.core.watchers);
            assert.equal(instance.watchers.core.watchers.length, 1);
            done();
        });
    });

    describe("E2E Adding namespaced watchers", function () {

        var instance, file;

        before(function (done) {

            browserSync.reset();

            file = path.join(outpath, "watch-func.txt");

            var config = {
                files:    "*.html",
                logLevel: "silent"
            };

            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Watches files when multi given", function (done) {

            assert.ok(instance.watchers.core.watchers);
            assert.ok(instance.watchers.core.watchers[0]);
            done();
        });
    });

    describe("E2E Adding namespaced watchers", function () {

        var instance, file;

        before(function (done) {

            browserSync.reset();

            file = path.join(outpath, "watch-func.txt");

            var config = {
                files:    [
                    "*.html",
                    {
                        match: "*.css",
                        fn: function (event, file) {
                            console.log(file);
                        }
                    }
                ],
                logLevel: "silent"
            };

            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Watches files when multi given + objs", function (done) {

            assert.ok(instance.watchers.core.watchers);
            assert.equal(instance.watchers.core.watchers.length, 2);
            done();
        });
    });
});
