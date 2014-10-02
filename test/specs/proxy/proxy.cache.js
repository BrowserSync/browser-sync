"use strict";

var cache        = require("../../../lib/server/proxy/lib/cache");

var assert       = require("chai").assert;
var sinon        = require("sinon");
var request      = require("supertest");

describe("Proxy Cache: ", function () {
    beforeEach(function() {
        cache.clearAll();
    });

    it("set and get", function () {
        cache.set("/url", "body", "value");
        assert.equal(cache.get("/url")["body"], "value");
        cache.set("/url2", "headers", {
          "cache-control": "no-cache",
          "connection": "close",
          "content-type": "text/html"
        });
        assert.equal(cache.get("/url2"), false);
        cache.set("/url2", "body", "content");
        assert.equal(cache.get("/url2")["headers"]["cache-control"], "no-cache");
        assert.equal(cache.get("/url2")["headers"]["connection"], "close");
        assert.equal(cache.get("/url2")["headers"]["content-type"], "text/html");
    });

    it("clears cache", function() {
        cache.set("/url", "body", "value");
        cache.clearAll();
        assert.equal(cache.get("/url"), false);
    });

    it("removes header", function() {
        cache.set("/url2", "headers", {
          "content-encoding": "gzip",
          "content-type": "text/html"
        });
        cache.set("/url2", "body", "content");
        cache.deleteHeader("/url2", "content-encoding");
        assert.equal(cache.get("/url2")["headers"]["content-encoding"], undefined);
    });

    it("middleware writes data correctly", function() {
        var req = {
                url: "/url"
            },
            res = {
                write: function() {},
                writeHead: function() {},
                end: function() {}
            };
        cache.cacheMiddleware(req, res, function() {
            res.writeHead(200);
            res.write("some data");
            res.end();
        });
        assert.equal(cache.get("/url")["body"], "some data");
        req = {
            url: "/url"
        };
        res = {
            write: function() {},
            writeHead: function() {},
            end: function() {}
        };
        cache.cacheMiddleware(req, res, function() {
            res.writeHead(200);
            res.end("data");
        });
        assert.equal(cache.get("/url")["body"], "data");
    });
});