// jscs:disable maximumLineLength

var defaultConfig = require("../../../dist/default-config");
var snippetUtils = require("../../../dist/snippet").utils;
var isExcluded = snippetUtils.isExcluded;
var assert = require("chai").assert;

describe("isExcluded spec", function() {
    var blackList;

    before(function() {
        blackList = defaultConfig.excludedFileTypes;
    });
    it("Should be a function", function() {
        assert.isFunction(isExcluded);
    });
    it("should return true if request contains queryString", function() {
        var actual = isExcluded("/styles/core.css?rel=12322", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request contains queryString", function() {
        var actual = isExcluded(
            "/imgs/img.jpg?rel=12322&test=2&34=q",
            blackList
        );
        assert.isTrue(actual);
    });
    it("should return FALSE for requests with no file noname (dir)", function() {
        var actual = isExcluded("/");
        assert.isFalse(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/core.js", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for CSS", function() {
        var actual = isExcluded("/styles/core.css", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.svg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.ico", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.woff", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.eot", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.ttf", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.png", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.jpg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.jpeg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.gif", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.json", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.mp4", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.mp3", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.ogg", blackList);
        assert.isTrue(actual);
    });
    it("should return true if request for JS", function() {
        var actual = isExcluded("/files.m4a", blackList);
        assert.isTrue(actual);
    });
});

describe("Header replacement for IE8", function() {
    it("Rewrites headers for old IE", function(done) {
        var bs = require("../../../");
        var request = require("supertest");
        bs.reset();
        bs.create().init(
            {
                logLevel: "silent",
                open: false,
                server: "test/fixtures"
            },
            function(err, bs) {
                request(bs.options.getIn(["urls", "local"]))
                    .get("/index.html")
                    .set(
                        "User-Agent",
                        "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
                    )
                    .set(
                        "accept",
                        "image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, */*"
                    )
                    .expect(200)
                    .end(function(err, res) {
                        assert.include(res.text, bs.options.get("snippet"));
                        bs.cleanup();
                        done();
                    });
            }
        );
    });
    it("Skips headers rewrites for excluded files for old IE", function(done) {
        var bs = require("../../../");
        var request = require("supertest");
        bs.reset();
        bs.create().init(
            {
                logLevel: "silent",
                open: false,
                server: "test/fixtures"
            },
            function(err, bs) {
                request(bs.options.getIn(["urls", "local"]))
                    .get("/css/bootstrap.css")
                    .set(
                        "User-Agent",
                        "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
                    )
                    .set(
                        "accept",
                        "image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, */*"
                    )
                    .expect(200)
                    .end(function(err, res) {
                        assert.notInclude(res.text, bs.options.get("snippet"));
                        bs.cleanup();
                        done();
                    });
            }
        );
    });
});
