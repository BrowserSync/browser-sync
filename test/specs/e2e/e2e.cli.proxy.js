"use strict";

var browserSync = require("../../../index");

var http        = require("http");
var path        = require("path");
var connect     = require("connect");
var serveStatic = require("serve-static");
var _           = require("lodash");
var request     = require("supertest");
var assert      = require("chai").assert;
var client      = require("socket.io-client");
var fork        = require("child_process").fork;

var index   = path.resolve( __dirname + "/../../../index.js");

describe("E2E CLI proxy test", function () {

    this.timeout(5000);

    var stubServer, bs, options;

    before(function (done) {

        var testApp = connect()
            .use(serveStatic(__dirname + "/../../fixtures/"));

        // server to proxy
        stubServer = http.createServer(testApp).listen(8080);

        bs = fork(index, ["start", "--proxy", "localhost:8080", "--no-open", "--logLevel=silent"]);

        bs.on("message", function (data) {
            options = data.options;
            done();
        });

        bs.send({send: "options"});
    });

    after(function () {
        bs.kill("SIGINT");
        stubServer.close();
    });

    it("Can serve the script", function (done) {

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
