"use strict";

var browserSync   = require("../../../index");
var tunnel        = require("../../../lib/tunnel");

var sinon   = require("sinon");
var assert  = require("assert");

describe("E2E server test with tunnel", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir:"test/fixtures"
            },
            debugInfo: false,
            open: false,
            tunnel: true,
            online: true
        };

        browserSync.use({
            "plugin:name": "tunnel",
            "plugin": function (bs, port, finished) {
                finished("http://localhost:8080", true);
            }
        });

        instance = browserSync(config, done);
    });

    after(function () {
//        stub.reset();
        instance.cleanup();
    });

    it("should call init on the tunnel", function () {
        assert.equal(instance.options.urls.tunnel, "http://localhost:8080");
    });
});
