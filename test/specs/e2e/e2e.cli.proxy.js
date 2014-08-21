"use strict";

var http        = require("http");
var path        = require("path");
var connect     = require("connect");
var serveStatic = require("serve-static");
var request     = require("supertest");
var assert      = require("chai").assert;
var fork        = require("child_process").fork;
var portScanner = require("portscanner-plus");

var index   = path.resolve( __dirname + "/../../../index.js");

describe.skip("E2E CLI proxy test", function () {

    this.timeout(5000);

    var stubServer, bs, options, instance;

    before(function (done) {

        var testApp = connect()
            .use(serveStatic(__dirname + "/../../fixtures/"));

        portScanner.getPorts(1).then(function (ports) {

            stubServer = http.createServer(testApp).listen(ports[0]);

            bs = fork(index, ["start", "--proxy", "localhost:" + ports[0], "--no-open", "--logLevel=silent"]);

            bs.on("message", function (data) {
                instance = data;
                options  = data.options;
                done();
            });

            bs.send({send: "options"});
        });
    });

    after(function (done) {
        bs.kill("SIGINT");
        stubServer.close();
        setTimeout(done, 200);
    });

    it("Can serve the script", function (done) {

        request(options.urls.local)
            .get(options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done(err);
            });
    });

    it("Can serve files", function (done) {
        request(options.urls.local)
            .get("/")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "BrowserSync + Public URL");
                done();
            });
    });

    it("Can serve files with snippet added", function (done) {
        request(options.urls.local)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, options.snippet);
                done();
            });
    });
});
