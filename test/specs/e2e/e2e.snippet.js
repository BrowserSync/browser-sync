"use strict";

var browserSync   = require("../../../index");

var path    = require("path");

var sinon   = require("sinon");
var _       = require("lodash");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E Snippet tests", function () {

    var instance;

    before(function (done) {

        var config = {
            debugInfo: false
        };

        instance = browserSync.init(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("returns the snippet URL", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
                done();
            });
    });
});
