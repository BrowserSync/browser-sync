"use strict";

var path    = require("path");
var _       = require("lodash");
var assert  = require("chai").assert;
var request = require("supertest");
var fork    = require("child_process").fork;

var index   = path.resolve( __dirname + "/../../../index.js");

describe("E2E server test", function () {

    var bs, options;

    before(function (done) {

        bs = fork(index, ["start", "--logLevel=silent"]);

        bs.on("message", function (data) {
            options = data.options;
            done();
        });

        bs.send({send: "options"});
    });

    after(function () {
        bs.kill("SIGINT");
    });

    it("can serve the client JS", function (done) {

        request(options.urls.local)
            .get(options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
                done();
            });
    });
});
