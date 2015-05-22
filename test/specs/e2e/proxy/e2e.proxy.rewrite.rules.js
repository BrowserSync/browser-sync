"use strict";

var browserSync = require("../../../../index");

var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E proxy test with rewrite rules", function () {

    var bs, server, options;

    before(function (done) {

        browserSync.reset();

        var app = connect();
        app.use("/index.html", function (req, res, next) {
            res.end('some content');
        });
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy:     proxytarget,
            logLevel: "silent",
            open:      false,
            rewriteRules: [
                {
                    match: /content/g,
                    fn: function () {
                        return "awesome content";
                    }
                }
            ]
        };

        bs = browserSync.init([], config, function (err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function () {
        bs.cleanup();
        server.close();
    });

    it.only("serves files with HTML rewritten", function (done) {

        request(bs.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {

                assert.include(res.text, "some awesome content");

                bs.addRewriteRule({
                    match: "some awesome content",
                    replace: "some REALLY awesome content"
                });

                request(bs.server)
                    .get("/index.html")
                    .set("accept", "text/html")
                    .expect(200)
                    .end(function (err, res) {
                        console.log(res.text);
                        done();
                    });
            });
    });
});
