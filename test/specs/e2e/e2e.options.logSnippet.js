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
        spy      = sinon.spy(console, "log");
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
        console.log.restore();
    });

    it("Can set the log snippet when given in options", function () {
        sinon.assert.notCalled(spy);
    });
});
