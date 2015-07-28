"use strict";

var path        = require("path");
//var request     = require("supertest");
var assert      = require("chai").assert;
var connect     = require("connect");
var browserSync = require(path.resolve("./"));
var serveStatic = require("serve-static");

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI proxy + websockets test", function () {

    var instance, server;

    before(function (done) {

        browserSync.reset();
        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        cli({
            cli: {
                input: ["start"],
                flags: {
                    proxy: proxytarget,
                    open: false,
                    online: false,
                    logLevel: "silent",
                    ws: true
                }
            },
            cb: function (err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function () {
        server.close();
        instance.cleanup();
    });
    it("Adds the proxy.ws options", function () {
        assert.equal(instance.options.getIn(["proxy", "ws"]), true);
    });
});
