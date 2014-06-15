"use strict";

var path    = require("path");
var http    = require("http");
var assert  = require("chai").assert;
var spawn   = require("child_process").spawn;

var index   = path.resolve( __dirname + "/../../../lib/index.js");

describe("E2E cli server test", function () {

    var bs, output;

    before(function (done) {

        bs = spawn("node", [index, "start", "--port=3001"]);

        bs.stdout.on("data", function (data) {
            output = data.toString();
            done();
        });
    });

    after(function () {
        bs.kill("SIGHUP");
    });

    it("returns the snippet", function (done) {

        assert.isTrue(output.indexOf("HOST:3001/browser-sync-client") > 0);

        var options = {
            hostname: "localhost",
            path: "/browser-sync-client.js",
            port: 3001
        };

        http.get(options, function (res) {
            var chunks = [];
            res.on("data", function (data) {
                chunks.push(data);
            }).on("end", function () {
                var joined = chunks.join("");
                assert.isTrue(joined.indexOf("Socket.IO.min.js") > 0);
                assert.isTrue(joined.indexOf("var ___socket___") > 0);
                assert.isTrue(joined.indexOf("Connected to BrowserSync") > 0);
                done();
            });
        });
    });
});
