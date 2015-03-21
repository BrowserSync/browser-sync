"use strict";

var browserSync = require("../../../../index");

var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;

describe("E2E proxy test with rewrite rules", function () {

    var instance, server, options;

    before(function (done) {

        browserSync.reset();

        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy:     proxytarget,
            logLevel: "silent",
            open:      false,
            rewriteRules: [
                {
                    match: /Forms/g,
                    fn: function () {
                        return "Shane's forms";
                    }
                }
            ]
        };

        instance = browserSync.init([], config, function (err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function () {
        instance.cleanup();
        server.close();
    });

    it("serves files with HTML rewritten", function (done) {

        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Shane's forms");
                done();
            });
    });
});
