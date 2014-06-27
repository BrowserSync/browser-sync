"use strict";

var browserSync   = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
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
            .get(instance.options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
                done();
            });
    });
});
