"use strict";

var path    = require("path");
var http    = require("http");
var assert  = require("chai").assert;
var spawn   = require("child_process").spawn;

var index   = path.resolve( __dirname + "/../../../lib/index.js");

describe("E2E server test", function () {

    var bs, output;

    before(function (done) {

        var called;

        bs = spawn("node", [index, "start", "--server", "--no-open", "--port=3001", "--files=*.php"]);

        bs.stdout.on("data", function (data) {
            output = data.toString();
            if (!called) {
                done();
                called = true;
            }
        });
    });

    after(function () {
        bs.kill("SIGHUP");
    });

    it("returns the snippet", function (done) {

        var options = {
            hostname: "localhost",
            path: "/test/fixtures/index.html",
            port: 3001,
            headers: {
                accept: "text/html"
            }
        };

        http.get(options, function (res) {
            var chunks = [];
            res.on("data", function (data) {
                chunks.push(data);
            }).on("end", function () {
                assert.isTrue(chunks.join("").indexOf("browser-sync-client") > 0);
                done();
            });
        });
    });
});
