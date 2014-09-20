"use strict";

var browserSync = require("../../../index");
var sinon       = require("sinon");

var socket = require("socket.io-client");

describe("E2E Sockets test", function () {

    var instance;

    before(function (done) {
        instance = browserSync({
            open: false,
            debugInfo: false
        }, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("should accept an event & broadcast it", function (done) {

        var called;
        instance.io.sockets.on("connection", function (client) {
            if (!called) {
                called = true;
                client.on("scroll", function () {
                    done();
                });
            }
        });

        var connectionUrl = instance.options.urls.local+instance.options.socket.namespace;
        var client1 = socket(connectionUrl, {path: instance.options.socket.path});

        client1.emit("scroll", {name:"shane"});
    });
});
