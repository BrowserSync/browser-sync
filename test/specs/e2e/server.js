"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

var fixturesDir = path.resolve(__dirname + "/../../fixtures");

describe.only("E2E server test", function () {

    var options;
    var instance;
    var servers;

    before(function (done) {

        var config = {
            server: {
                baseDir: fixturesDir
            }
        };

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            servers  = bs.servers;
            instance = bs;
            done()
        });

    });

    it("returns the snippet", function (done) {

        assert.isString(options.snippet);
        assert.isDefined(servers.staticServer);

        request(servers.staticServer)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                console.log(res.text);
                assert.isTrue(res.text.indexOf("browser-sync-client") > 0);
                done();
            });
    });
});
