"use strict";

var request = require("request");
var assert  = require("chai").assert;
var exec    = require("child_process").exec;

describe("E2E CLI server test", function () {

    var bs;
    var chunks = [];

    before(function (done) {
        var count = 0;
        var called = false;
        bs = exec(["node", __dirname + "/../../../bin/browser-sync.js", "start", "--server", "test/fixtures", "--no-open"].join(" "));
        bs.stdout.on("data", function (data) {
            chunks.push(data);
            count += 1;
            if (chunks.join("").indexOf("Local") > -1) {
                if (!called) {
                    called = true;
                    return done();
                }
            }
        });
    });
    after(function () {
        bs.kill("SIGTERM");
    });
    it("returns the snippet", function (done) {
        var url = chunks.join("").match("http://localhost:(\\d){4}");
        request(url[0] + "/browser-sync/browser-sync-client.js", function (req, res, body) {
            console.log(url[0] + "/browser-sync/browser-sync-client.js");
            assert.include(body, "window.___browserSync___oldSocketIo");
            done();
        });
    });
    it("returns the index", function (done) {
        var url = chunks.join("").match("http://localhost:(\\d){4}");
        request(url[0], function (req, res, body) {
            assert.include(body, "<title>Test HTML Page</title>");
            done();
        });
    });
});
