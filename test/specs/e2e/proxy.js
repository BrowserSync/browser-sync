"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");
var sinon   = require("sinon");
var http    = require("http");
var connect = require("connect");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E proxy test", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        var config = {
            proxy: "localhost:8000",
            debugInfo: false,
            shane: true
        };

        var testApp = connect()
            .use(connect.static(__dirname + "/../../fixtures"));

        // server to proxy
        http.createServer(testApp).listen(8000);

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.proxyServer;
            instance = bs;
            done();
        });
    });

    after(function () {
        server.close();
    });

    it("can init proxy", function (done) {

        assert.isString(options.snippet);
        assert.isDefined(server);

        request(server)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("browser-sync-client") > 0);
                done();
            });
    });
});
