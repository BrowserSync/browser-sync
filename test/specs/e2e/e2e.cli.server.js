"use strict";

var path     = require("path");
var _        = require("lodash");
var request  = require("supertest");
var server = require("./commands.server.json");
var assert   = require("chai").assert;
var fork     = require("child_process").fork;

var index   = path.resolve( __dirname + "/../../../index.js");

describe("E2E CLI server test", function () {

    this.timeout(5000);

    var bs, options;

    before(function (done) {


        bs = fork(index, server.commands[0].args);

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
            .get(options.scriptPaths.versioned)
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