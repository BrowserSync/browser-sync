"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E options test", function () {

    var options;
    var instance;

    before(function (done) {
        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            debugInfo: false,
            open: false
        };
        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            done();
        });
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.isNotNull(match);
    });
});
