"use strict";

var defaultConfig = require("../../../lib/default-config");
var messages      = require("../../../lib/messages");
var server        = require("../../../lib/server/");
var snippetUtils  = require("../../../lib/snippet").utils;
var isExcluded    = snippetUtils.isExcluded;

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

var options = {
    version: "0.1.0",
    port: 3000,
    host: "localhost"
};

var snippet = messages.scriptTags(options.port, options);

describe("Launching a server with snippets", function () {

    var io;
    var app;
    var clientsSpy;
    var emitSpy;
    var reqOptions;

    before(function () {
        clientsSpy = sinon.stub().returns([]);
        emitSpy = sinon.spy();
        io = {
            sockets: {
                clients: clientsSpy,
                emit: emitSpy
            }
        };
    });

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            },
            version: "0.1.0",
            port: 3000
        };
        reqOptions = {
            hostname: "0.0.0.0",
            port: options.port,
            path: "/",
            method: "GET",
            headers: {
                accept: "text/html"
            }
        };

        app = server.launchServer(options, "SCRIPT");
    });

    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
    });

    it("can append the script tags to the body of html files", function (done) {
        request(app)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                var actual = res.text.indexOf(snippet) >= 0;
                assert.isTrue(actual);
                done();
            });
    });

    it("can append the script tags to the body of a LARGE html FILE", function (done) {
        request(app)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                var actual = res.text.indexOf(snippet) >= 0;
                assert.isTrue(actual);
                done();
            });
    });
});

describe("isExcluded spec", function () {

    var blackList;

    before(function () {
        blackList = defaultConfig.excludedFileTypes;
    });
    it("Should be a function", function () {
        assert.isFunction(isExcluded);
    });
    it("should return true if request contains queryString", function () {
        var actual = isExcluded("/styles/core.css?rel=12322", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request contains queryString", function () {
        var actual = isExcluded("/imgs/img.jpg?rel=12322&test=2&34=q", blackList);
        assert.isTrue(actual);
    });
    it("should return FALSE for requests with no file noname (dir)", function () {
        var actual = isExcluded("/");
        assert.isFalse(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/core.js", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for CSS", function () {
        var actual = isExcluded("/styles/core.css", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.svg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.ico", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.woff", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.eot", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.ttf", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.png", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.jpg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.jpeg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.gif", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.json", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.mp4", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.mp3", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.ogg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function () {
        var actual = isExcluded("/files.m4a", blackList);
        assert.isTrue(actual);
    });
});

describe("Header replacement for IE8", function () {

    var blackList;
    var req;
    var isOldIe;
    before(function () {
        blackList = defaultConfig.excludedFileTypes;
    });
    beforeEach(function () {
        isOldIe = snippetUtils.isOldIe;
        req = {
            url: "/",
            headers: {
                "accept": "image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, */*",
                "user-agent": "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
            }
        };
    });
    it("Should be a function", function () {
        assert.isFunction(isOldIe);
    });
    it("should re-write the headers for IE", function () {
        var actual = isOldIe(req).headers.accept;
        var expected = "text/html";
        assert.equal(actual, expected);
    });
    it("should re-write the headers for IE", function () {
        req.url = "/core.css?rel=123446";
        req.headers.accept = "**/*";
        var actual = isOldIe(req).headers.accept;
        var expected = "**/*";
        assert.equal(actual, expected);
    });
    it("should re-write any headers for excluded files", function () {
        req.url = "/css/style.css";
        req.headers.accept = "**/*";
        var actual = snippetUtils.isOldIe(req, blackList).headers.accept;
        var expected = "**/*";
        assert.equal(actual, expected);
    });
});