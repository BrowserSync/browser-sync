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

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};
var options = {};
var serverHost = "http://0.0.0.0:" + ports.server;
var snippet = messages.scriptTags("0.0.0.0", ports, options);

describe("Launching a server with snippets", function () {

    var servers, reqCallback;

    var io;
    var clientsSpy;
    var emitSpy;

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
    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
    });

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };

        servers = server.launchServer("0.0.0.0", ports, options, io);
    });

    afterEach(function () {
        servers.staticServer.close();
    });

    /**
     *
     *
     * SMALL HTML PAGE
     *
     *
     */
    it("can append the script tags to the body of html files", function (done) {

        http.get(serverHost + "/index.html", function (res) {
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
        });
    });

    /**
     *
     *
     * LARGE HTML PAGE
     *
     *
     */
    it("can append the script tags to the body of a LARGE html FILE", function (done) {
        http.get(serverHost + "/index-large.html", function (res) {
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