"use strict";

var browserSync   = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E Snippet tests", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        var config = {
            debugInfo: false
        };

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("returns the snippet URL", function (done) {

        request(server)
            .get(options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
                done();
            });
    });
});
