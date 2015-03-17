"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline with errors", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "error",
            plugins: ["some-rnadomw-name-that-does-not-exist"]
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should give good errors when a plugin does not exist", function (done) {
        assert.equal(instance.getUserPlugins().length, 0);
        done();
    });
});
