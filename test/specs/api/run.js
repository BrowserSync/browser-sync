"use strict";

var browserSync     = require("../../../");
var sinon           = require("sinon");
var assert          = require("assert");

describe("API: .run() - public task runner", function () {
    it("should run a single fn and resolve", function (done) {

        browserSync.reset();

        function task (deferred, previous) {
            deferred.resolve(previous + " - Task 1");
        }

        return browserSync.run([task], "Initial")
            .then(function (out) {
                assert.equal(out, "Initial - Task 1");
                done();
            }).done();
    });
    it("should run multi fns and resolve", function (done) {

        browserSync.reset();

        var bs = browserSync.create("test");

        function task (deferred, previous) {
            deferred.resolve(previous + " - Task 1");
        }
        function task2 (deferred, previous) {
            deferred.resolve(previous + " - Task 2");
        }

        return bs.run([task, task2], "Initial")
            .then(function (out) {
                assert.equal(out, "Initial - Task 1 - Task 2");
                done();
            }).done();
    });
    it("should run a single fn and reject", function (done) {

        browserSync.reset();

        var bs = browserSync.create("test");

        function task (deferred) {
            deferred.reject(new Error("Error from Task 1"));
        }

        return bs.run([task], "Initial")
            .catch(function (err) {
                assert.equal(err.message, "Error from Task 1");
                done();
            });
    });
    it("should run a single fn and notify", function (done) {

        browserSync.reset();

        var bs = browserSync.create("test");

        function task (deferred) {
            deferred.notify("Task 1 Complete");
        }

        return bs.run([task])
            .progress(function (msg) {
                assert.equal(msg, "Task 1 Complete");
                done();
            }).done();
    });
    it("should run multi fns and notify", function (done) {

        browserSync.reset();

        var bs = browserSync.create("test");
        var spy = sinon.spy();

        function task (deferred) {
            deferred.notify("Task 1 Complete");
            deferred.resolve();
        }

        function task2 (deferred) {
            deferred.notify("Task 2 Complete");
            deferred.resolve();
        }

        return bs.run([task, task2])
            .progress(spy).then(function () {
                sinon.assert.calledTwice(spy);
                assert.equal(spy.getCall(0).args[0], "Task 1 Complete");
                assert.equal(spy.getCall(1).args[0], "Task 2 Complete");
                done();
            }).done();
    });
});
