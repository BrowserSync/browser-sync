"use strict";

var path    = require("path");
var _       = require("lodash");
var request = require("supertest");
var assert  = require("chai").assert;
var fork    = require("child_process").fork;

var index   = path.resolve( __dirname + "/../../../lib/index.js");

describe("E2E CLI server test", function () {

    var bs, options;

    before(function (done) {

        bs = fork(index, ["start", "--server", "test/fixtures", "--no-open", "--logLevel=silent"]);

        bs.on("message", function (data) {
            options = data.options;
            done();
        });

        bs.send({send: "options"});
    });

    after(function () {
        bs.kill("SIGINT");
    });

    it("returns the snippet", function (done) {

        request(options.urls.local)
            .get(options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
                done();
            });
    });

    it("Can serve files", function (done) {
        request(options.urls.local)
            .get("/")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "BrowserSync + Public URL"));
                done();
            });
    });

    it("Can serve files with snippet added", function (done) {
        request(options.urls.local)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, options.snippet));
                done();
            });
    });
});
