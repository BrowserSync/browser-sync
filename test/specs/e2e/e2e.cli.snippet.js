"use strict";

var path    = require("path");
var assert  = require("chai").assert;
var request = require("supertest");
var fork    = require("child_process").fork;

var index   = path.resolve(__dirname + "/../../../index.js");

describe.skip("E2E CLI Snippet test", function () {

    // use `mocha --timeout` option instead
    //this.timeout(5000);

    var bs, options;

    before(function (done) {

        bs = fork(index, ["start", "--logLevel=silent"]);

        bs.on("message", function (data) {
            options = data.options;
            done();
        });

        bs.send({send: "options"});
    });

    after(function (done) {
        bs.kill("SIGINT");
        setTimeout(done, 200); // Allow server to close successfully
    });

    it("can serve the client JS", function (done) {

        request(options.urls.local)
            .get(options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
