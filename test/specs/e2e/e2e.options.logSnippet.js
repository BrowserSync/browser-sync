"use strict";

var browserSync = require("../../../index");

var sinon       = require("sinon");

describe("E2E `logSnippet` option", function () {

    var instance;
    var spy;

    before(function (done) {
        var config = {
            online: false,
            open: false,
            logSnippet: false
        };
        instance = browserSync(config, done);
        spy      = sinon.spy(console, "log");
    });

    after(function () {
        instance.cleanup();
        spy.restore();
    });

    it("Can set the log snippet when given in options", function () {
        sinon.assert.notCalled(spy);
    });
});
