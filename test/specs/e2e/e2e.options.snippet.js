"use strict";

var browserSync = require("../../../index");

var assert      = require("chai").assert;
var request     = require("supertest");

describe("E2E snippet ignore paths test", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            snippetOptions: {
                ignorePaths: "iframe.html"
            }
        };
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("does not inject the snippet when excluded path hit", function (done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.notInclude(res.text, instance.options.snippet);
                done();
            });
    });
});
describe("E2E snippet custom regex", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            snippetOptions: {
                rule: {
                    match: /<head[^>]*>/i,
                    fn: function (snippet, match) {
                        return match + snippet;
                    }
                }
            }
        };
        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("uses a user-provided regex", function (done) {
        request(instance.server)
            .get("/iframe.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "<head>" + instance.options.snippet);
                done();
            });
    });
});
