"use strict";

var browserSync = require("../../../../index");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("E2E httpModule options test", function () {

    this.timeout(15000);

    var bs;
    var mockHttpModule, mockHttpServer, createServerSpy, https;

    describe("httpModule undefined", function () {

        before(function (done) {

            browserSync.reset();
            https = require("https");
            
            createServerSpy = sinon.spy(https, "createServer");

            var config = {
                server:    {
                    baseDir: "test/fixtures",
                },
                https: true,
                open: false,
                logLevel: "silent"
            };

            bs = browserSync.init(config, done).instance;
        });

        after(function () {
            bs.cleanup();
        });

        it("creates server using the default https module", function () {
            sinon.assert.calledOnce(createServerSpy);
        });

        it("should be using the server from the https module", function () {
            assert.equal(bs.server instanceof https.Server, true);
        });        
    });

    describe("httpModule defined", function () {

        before(function (done) {

            browserSync.reset();

            mockHttpServer = {
                on: function() { },
                listen: function() { },
                listeners: function() { return []; },
                removeAllListeners: function() { },
                close: function() { }
            };

            mockHttpModule = {
                createServer: function() {
                    return mockHttpServer;
                }
            };

            createServerSpy = sinon.spy(mockHttpModule, "createServer");

            var config = {
                server:    {
                    baseDir: "test/fixtures",
                },
                https: true,
                httpModule: mockHttpModule,
                open: false,
                logLevel: "silent"
            };

            bs = browserSync.init(config, done).instance;
        });

        after(function () {
            bs.cleanup();
        });

        it("creates server using provided httpModule", function () {
            sinon.assert.calledOnce(createServerSpy);
        });

        it("should be using the server created by the provided httpModule", function () {
            assert.equal(bs.server, mockHttpServer);
        });
    });
});
