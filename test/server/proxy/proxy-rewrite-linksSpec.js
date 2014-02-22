var bs = require("../../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../../lib/messages");
var _ = require("lodash");
var http = require("http");
var proxy = require("../../../lib/proxy");
var utils = proxy.utils;
var assert = require("chai").assert;
var fs = require("fs");

var html1 = fs.readFileSync("test/fixtures/proxy-ip.html").toString();
var html2 = fs.readFileSync("test/fixtures/proxy-vhost.html").toString();

var ports = [3000, 3001, 3002];
var proxyUrl = "192.168.0.4:3002";

describe("Rewriting Domains", function () {

    var ipServer, vhostServer;
    before(function () {
        ipServer = {
            host: "0.0.0.0",
            port: 8001
        };
        vhostServer = {
            host: "local.dev"
        };
    });
    it("should domain replace in a string (1)", function () {
        var html = "<a href='http://0.0.0.0:8001'>Link 1</a>";
        var actual = utils.rewriteLinks(ipServer, proxyUrl)(html);
        var expected = "<a href='http://192.168.0.4:3002'>Link 1</a>";
        assert.equal(actual, expected);
    });
    it("should domain replace in a string (2)", function () {
        var html = "<a href='http://0.0.0.0:8001/about.html'>Link 1</a>";
        var actual = utils.rewriteLinks(ipServer, proxyUrl)(html);
        var expected = "<a href='http://192.168.0.4:3002/about.html'>Link 1</a>";
        assert.equal(actual, expected);
    });
    it("should domain replace in a string (1)", function () {
        var html = "<a href='http://local.dev'>Link 1</a>";
        var actual = utils.rewriteLinks(vhostServer, proxyUrl)(html);
        var expected = "<a href='http://192.168.0.4:3002'>Link 1</a>";
        assert.equal(actual, expected);
    });
    it("should domain replace in a string (2)", function () {
        var html = "<a href='http://local.dev/about.html'>Link 1</a>";
        var actual = utils.rewriteLinks(vhostServer, proxyUrl)(html);
        var expected = "<a href='http://192.168.0.4:3002/about.html'>Link 1</a>";
        assert.equal(actual, expected);
    });
    it("should not replace the domain in linkns if not found", function () {
        var html = "<a href='/'>Link 1</a>";
        var actual = utils.rewriteLinks(ipServer, proxyUrl)(html);
        var expected = "<a href='/'>Link 1</a>";
        assert.equal(actual, expected);
    });
});

describe("Rewriting links in HTML response with IP + HOST (E2E 1)", function () {

    var userServer, localHtml;
    before(function () {
        userServer = {
            host: "0.0.0.0",
            port: 8001
        };
    });
    beforeEach(function () {
        localHtml = _.clone(html1);
    });

    it("can rewrite domain name in HTML", function () {
        var newHtml = utils.rewriteLinks(userServer, proxyUrl)(localHtml);
        assert.equal(~newHtml.indexOf("0.0.0.0:8001"), false);
        assert.isTrue(newHtml.indexOf(proxyUrl) >= 0);
    });
});

describe("Rewriting links in HTML response with VHOST", function () {

    var serverHost, localHtml;
    before(function () {
        serverHost = {
            host: "local.dev"
        };
    });
    beforeEach(function () {
        localHtml = _.clone(html2);
    });

    it("can rewrite domain name in HTML", function () {
        var newHtml = utils.rewriteLinks(serverHost, proxyUrl)(localHtml);
        assert.equal(~newHtml.indexOf("local.dev"), false);
        assert.isTrue(newHtml.indexOf(proxyUrl) >= 0);
    });
});

describe("Rewriting links in HTML response with VHOST & default port given", function () {

    var serverHost, localHtml;
    before(function () {
        serverHost = {
            host: "local.dev",
            port: 80
        };
    });
    beforeEach(function () {
        localHtml = _.clone(html2);
    });

    it("can rewrite domain name in HTML", function () {
        var newHtml = utils.rewriteLinks(serverHost, proxyUrl)(localHtml);
        assert.equal(~newHtml.indexOf("local.dev"), false);
        assert.isTrue(newHtml.indexOf(proxyUrl) >= 0);
    });
});