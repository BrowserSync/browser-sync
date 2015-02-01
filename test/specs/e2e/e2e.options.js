"use strict";

var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");
var portScanner = require("portscanner");

describe("e2e options test", function () {

    beforeEach(function () {
        browserSync.reset();
    });

    describe("E2E options test", function () {

        var instance, port;

        before(function (done) {

            browserSync.reset();

            portScanner.findAPortNotInUse(3000, 4000, {
                host:    "localhost",
                timeout: 1000
            }, function (err, _port) {

                port = _port;

                var config = {
                    server:   {
                        baseDir: "test/fixtures"
                    },
                    port:     port,
                    open:     false,
                    logLevel: "silent"
                };

                instance = browserSync(config, done).instance;

            });
        });
        after(function () {
            instance.cleanup();
        });

        it("Sets the available port", function () {
            var match = /\d{2,5}/.exec(instance.options.get("port"))[0];
            assert.isNotNull(match);
        });
        it("Uses the given port the available port", function () {
            var match = /\d{2,5}/.exec(instance.options.get("port"))[0];
            assert.equal(match, port);
        });
    });

    describe("E2E options test", function () {

        var instance;

        before(function (done) {
            browserSync.reset();
            var config = {
                server:   {
                    baseDir: "test/fixtures"
                },
                files:    ["*.html"],
                ports:    {
                    min: 3500
                },
                logLevel: "silent",
                open:     false
            };

            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the available port", function () {
            var match = /\d{2,5}/.exec(instance.options.get("port"))[0];
            assert.isNotNull(match);
        });
        it("Uses the given port the available port", function () {
            var match = /\d{2,5}/.exec(instance.options.get("port"))[0];
            assert.equal(match, 3500);
        });
        it("set's the files option", function () {
            assert.deepEqual(instance.options.get("files").toJS(), {
                core: ["*.html"]
            });
        });
    });

    describe("E2E NO OPTIONS test with snippet", function () {

        var instance;
        var stub;

        before(function (done) {
            stub = sinon.spy(console, "log");
            instance = browserSync([], null, done).instance;
        });

        after(function () {
            instance.cleanup();
            console.log.restore();
        });

        it("Sets the available port", function () {
            var match = /\d{2,5}/.exec(instance.options.get("port"))[0];
            assert.isNotNull(match);
        });
        it("sets the open options to false", function () {
            assert.deepEqual(instance.options.get("open"), false);
        });
    });

    describe("E2E NO OPTIONS", function () {

        var instance;

        before(function (done) {
            instance = browserSync([], {logLevel: "silent"}, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options", function () {

            var ghostMode = instance.options.get("ghostMode").toJS();

            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
        });
    });

    describe("E2E GHOST OPTIONS", function () {

        var instance;

        var config = {
            ghostMode: {
                links: true,
                forms: {
                    submit: false
                }
            },
            logLevel:  "silent"
        };

        before(function (done) {
            instance = browserSync([], config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options", function () {

            var ghostMode = instance.options.get("ghostMode").toJS();

            assert.deepEqual(ghostMode.links, true);
            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
        });
    });

    describe("E2E GHOST OPTIONS (NO GHOSTMODE)", function () {

        var instance;

        var config = {
            ghostMode: false,
            logLevel:  "silent"
        };

        before(function (done) {
            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options in shorthand", function () {
            var ghostMode = instance.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, false);
            assert.deepEqual(ghostMode.forms.toggles, false);
        });
    });

    describe("E2E GHOST OPTIONS (WITH GHOSTMODE)", function () {

        var instance;

        var config = {
            ghostMode: true,
            logLevel:  "silent"
        };

        before(function (done) {
            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options in shorthand", function () {
            var ghostMode = instance.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.clicks, true);
            assert.deepEqual(ghostMode.scroll, true);
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
        });
    });

    describe("E2E GHOST OPTIONS (NO FORMS)", function () {

        var instance;

        var config = {
            ghostMode: {
                forms: false
            },
            logLevel:  "silent"
        };

        before(function (done) {
            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options in shorthand", function () {
            var ghostMode = instance.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, false);
            assert.deepEqual(ghostMode.forms.inputs, false);
            assert.deepEqual(ghostMode.forms.toggles, false);
        });
    });

    describe("E2E GHOST OPTIONS (ALL FORMS)", function () {

        var instance;

        var config = {
            ghostMode: {
                forms: true
            },
            logLevel:  "silent"
        };

        before(function (done) {
            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options in shorthand", function () {
            var ghostMode = instance.options.get("ghostMode").toJS();
            assert.deepEqual(ghostMode.forms.submit, true);
            assert.deepEqual(ghostMode.forms.inputs, true);
            assert.deepEqual(ghostMode.forms.toggles, true);
        });
    });

    describe("E2E HOST OPTIONS + localhost", function () {

        var instance;

        var config = {
            host:     "localhost",
            logLevel: "silent"
        };

        before(function (done) {
            instance = browserSync(config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the ghostMode options", function () {
            assert.ok(instance.options.get("port").toString().match(/\d\d\d\d/));
            assert.ok(instance.options.getIn(["urls", "local"]).match(/\d{4,5}$/));
        });
    });

    describe("E2E OLD API FILES OPTION", function () {

        var instance;

        var config = {
            host:     "localhost",
            online:   false,
            logLevel: "silent"
        };

        before(function (done) {
            instance = browserSync.init(["*.html"], config, done).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the files option with the old API", function () {
            assert.deepEqual(instance.options.get("files").toJS(), {
                core: ["*.html"]
            });
        });
    });

    describe("E2E OLD API FILES OPTION", function () {

        var instance;

        before(function (done) {
            browserSync.emitter.on("init", function () {
                done();
            });
            instance = browserSync.init(["*.html"]).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the files option with the old API", function () {
            assert.deepEqual(instance.options.get("files").toJS(), {
                core: ["*.html"]
            });
        });
    });

    describe("E2E OLD API FILES OPTION", function () {

        var instance;

        before(function (done) {
            browserSync.emitter.on("init", function () {
                done();
            });
            instance = browserSync.init(["*.html"], {}).instance;
        });

        after(function () {
            instance.cleanup();
        });

        it("Sets the files option with the old API", function () {
            assert.deepEqual(instance.options.get("files").toJS(), {
                core: ["*.html"]
            });
        });
    });
});
