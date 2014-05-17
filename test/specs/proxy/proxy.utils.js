"use strict";

var proxy  = require("../../../lib/proxy");
var utils  = proxy.utils;

var assert = require("chai").assert;

var ports = [3000, 3001, 3002];
var proxyUrl = "192.168.0.4:3002";

describe("Rewriting Domains", function () {

    var ipServer, vhostServer, ipServerDefault;

    beforeEach(function () {
        ipServer = {
            host: "0.0.0.0",
            port: 8001
        };
        ipServerDefault = {
            host: "0.0.0.0",
            port: 80
        };
        vhostServer = {
            host: "local.dev"
        };
    });

    describe("when rewriting 'example.com' links", function () {

        var regex, fn;
        var testRegex;
        before(function () {
            var rewrite = utils.rewriteLinks({host: "example.com", port: 80}, proxyUrl);
            regex       = rewrite.match;
            fn          = rewrite.fn;
            testRegex = function (string) {
                return string.replace(regex, fn);
            };
        });

        it("should not replace domains that are not inside attribute", function () {
            var actual   = testRegex("<h1>example.com</h1>");
            var expected =           "<h1>example.com</h1>";
            assert.equal(actual, expected);
        });
        it("should replace CSS LINK", function () {
            var actual   = testRegex("<link href='http://example.com/css/styles'>example.com</link>");
            var expected =           "<link href='http://192.168.0.4:3002/css/styles'>example.com</link>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (2)", function () {
            var actual   = testRegex("<a href='http://example.com'></a>");
            var expected           = "<a href='http://192.168.0.4:3002'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (23)", function () {
            var actual   = testRegex("<a href='http://example.com/sub/dir'></a>");
            var expected           = "<a href='http://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (3)", function () {
            var actual   = testRegex("<a href='http://example.com/sub/dir'></a>");
            var expected           = "<a href='http://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (4)", function () {
            var actual   = testRegex("<a href='https://example.com/sub/dir'></a>");
            var expected           = "<a href='https://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (5)", function () {
            var actual   = testRegex("<a href='/example.com/sub/dir'></a>");
            var expected           = "<a href='/192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (6)", function () {
            var actual   = testRegex("<a href='example.com/sub/dir'></a>");
            var expected           = "<a href='192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (6)", function () {
            /*jshint ignore:start*/
            var actual   = testRegex('<a href="http://example.com" class="active" title="Home">Home</a><a href="http://example.com/information" class="" title="Info">Info</a>');
            var expected           = '<a href="http://192.168.0.4:3002" class="active" title="Home">Home</a><a href="http://192.168.0.4:3002/information" class="" title="Info">Info</a>';
            assert.equal(actual, expected);
            /*jshint ignore:end*/
        });
        it("should use the regex to replace links (7)", function () {
            var actual   = testRegex("<a href='http://example.com/sub/dir/example.com/css/styles.css'></a><a href='http://example.com/sub/dir/example.com/css/styles.css'></a>");
            var expected           = "<a href='http://192.168.0.4:3002/sub/dir/example.com/css/styles.css'></a><a href='http://192.168.0.4:3002/sub/dir/example.com/css/styles.css'></a>";
            assert.equal(actual, expected);
        });
    });
    describe("when rewriting 'localhost:8000' links", function () {

        var regex, fn;
        var testRegex;
        before(function () {
            var rewrite = utils.rewriteLinks({host: "localhost:8000", port: 80}, proxyUrl);
            regex       = rewrite.match;
            fn          = rewrite.fn;
            testRegex = function (string) {
                return string.replace(regex, fn);
            };
        });
        it("should use the regex to replace links (1)", function () {
            var actual   = testRegex("<a href='http://localhost:8000'></a>");
            var expected           = "<a href='http://192.168.0.4:3002'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (1)", function () {
            var actual   = testRegex("<a href='http://localhost:8000'></a>");
            var expected           = "<a href='http://192.168.0.4:3002'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (2)", function () {
            var actual   = testRegex("<a href='http://localhost:8000/sub/dir'></a>");
            var expected           = "<a href='http://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (3)", function () {
            var actual   = testRegex("<a href='http://localhost:8000/sub/dir'></a>");
            var expected           = "<a href='http://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (4)", function () {
            var actual   = testRegex("<a href='https://localhost:8000/sub/dir'></a>");
            var expected           = "<a href='https://192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (5)", function () {
            var actual   = testRegex("<a href='/localhost:8000/sub/dir'></a>");
            var expected           = "<a href='/192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
        it("should use the regex to replace links (6)", function () {
            var actual   = testRegex("<a href='localhost:8000/sub/dir'></a>");
            var expected           = "<a href='192.168.0.4:3002/sub/dir'></a>";
            assert.equal(actual, expected);
        });
    });


    describe("getProxyUrl(): ", function() {
        it("should return a full url", function () {
            var opts = {
                protocol: "http",
                host: "localhost",
                port: 80
            };
            var actual   = utils.getProxyUrl(opts);
            var expected = "http://localhost";
            assert.equal(actual, expected);
        });
        it("should return a full url", function () {
            var opts = {
                protocol: "https",
                host: "local.dev",
                port: 8000
            };
            var actual   = utils.getProxyUrl(opts);
            var expected = "https://local.dev:8000";
            assert.equal(actual, expected);
        });
    });


    describe("handling redirects", function () {
        var opts;
        beforeEach(function () {
            opts = {
                protocol: "http",
                host: "blossom.dev",
                port: 80
            };
        });
        it("should replace a 302 redirect link", function () {
            var host = "192.168.0.5";
            var port = 3002;
            var url = "http://blossom.dev/index.php/install/";
            var expected = "http://192.168.0.5:3002/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
        it("should replace a 302 redirect link", function () {
            var host = "192.168.0.6";
            var port = 3003;
            var url = "http://blossom.dev/index.php/install/";
            var expected = "http://192.168.0.6:3003/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
        it("should replace a 302 redirect link", function () {
            opts.port = 8000;
            var host = "192.168.0.6";
            var port = 3003;
            var url = "http://blossom.dev:8000/index.php/install/";
            var expected = "http://192.168.0.6:3003/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
    });
});
