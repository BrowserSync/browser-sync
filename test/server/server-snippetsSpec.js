var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var sinon = require("sinon");
var _ = require("lodash");
var assert = require("chai").assert;
var server = require("../../lib/server");
var index = require("../../lib/index");
var defaultConfig = index.defaultConfig;
var snippetUtils = require("../../lib/snippet").utils;
var isExcluded = snippetUtils.isExcluded;
var isOldIe = snippetUtils.isOldIe;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};
var options = {};
var serverHost = "http://0.0.0.0:" + ports.server;
var snippet = messages.scriptTags("0.0.0.0", ports, options);

describe("Launching a server with snippets", function () {

    var servers;
    var io;
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
            }
        };
        reqOptions = {
            hostname: "0.0.0.0",
            port: ports.server,
            path: "/",
            method: "GET",
            headers: {
                accept: "text/html"
            }
        };

        servers = server.launchServer("0.0.0.0", ports, options, io);
    });

    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
        servers.staticServer.close();
    });

    it("can append the script tags to the body of html files", function (done) {
        reqOptions.path = "/index.html";
        http.request(reqOptions, function (res) {
            var chunks = [];
            var data;
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.isTrue(data.indexOf(snippet) >= 0);
                done();
            });
        }).end();
    });

    it("can append the script tags to the body of a LARGE html FILE", function (done) {
        reqOptions.path = "/index-large.html";
        http.request(reqOptions, function (res) {
            var chunks = [];
            var data;
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.isTrue(data.indexOf(snippet) >= 0);
                done();
            });
        }).end();
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

    before(function () {
        blackList = defaultConfig.excludedFileTypes;
    });
    beforeEach(function () {
        req = {
            url: "/",
            headers: {
                "accept": "image/jpeg, application/x-ms-application, image/gif, application/xaml+xml, image/pjpeg, application/x-ms-xbap, */*",
                "user-agent": "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
            }
        }
    });
    it("Should be a function", function () {
        assert.isFunction(isOldIe);
    });
    it("should re-write the headers for IE", function () {
        var actual = isOldIe(req).headers.accept;
        var expected = "text/html";
        assert.equal(actual, expected);
    });
});