"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline, but with error", function () {
    it.only("Should fail if a plugin error occurred", function (done) {
        browserSync.reset();

        browserSync({
            plugins: {
                module: {plugin: function () {

                }}
            },
            open: false,
            logLevel: "silent"
        }, function (err, bs) {
            console.log(err);
            done();
        });
    });
});
