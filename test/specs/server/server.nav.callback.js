var server = require("../../../lib/server");
var defaultConfig = require("../../../lib/default-config");
var assert = require("chai").assert;
var sinon = require("sinon");
var request = require("supertest");
var canNavigate = server.utils.canNavigate;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

var options = { server: {} };

describe("the navigateCallback function (ghostmode links ON)", function () {

    var io;
    var clientsSpy;
    var emitSpy;
    var func;
    var next;
    var options;

    before(function () {
        clientsSpy = sinon.stub().returns([]);
        emitSpy = sinon.spy();
        io = {
            sockets: {
                clients: clientsSpy,
                emit: emitSpy
            }
        };
        options = {
            ghostMode: {
                links: true
            }
        };
        func = server.utils.navigateCallback(io, options);
        next = sinon.spy();
    });
    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
    });

    it("should return a function to be used as middleware", function () {
        assert.isFunction(func);
    });
    it("should return a function to be that has three params", function () {
        assert.equal(func.length, 3);
    });
    it("should call sockets.clients() if the req url is not in excluded list", function () {
        func({url: "/", method:"GET"}, {}, next);
        sinon.assert.called(clientsSpy);
    });
    it("should call sockets.clients() if the req url is not in excluded list (2)", function () {
        func({url: "/index.html", method:"GET"}, {method:"GET"}, next);
        sinon.assert.called(clientsSpy);
    });
    it("should NOT call sockets.clients() if the req url IS in excluded list (1)", function () {
        func({url: "/core.css"}, {}, next);
        sinon.assert.notCalled(clientsSpy);
    });
    it("should NOT call sockets.clients() if the req url IS in excluded list (2)", function () {
        func({url: "/font.woff"}, {}, next);
        sinon.assert.notCalled(clientsSpy);
    });
    it("E2E", function (done) {
        var options = {
            ghostMode: {
                links: true
            },
            server: {
                baseDir: "test/fixtures"
            }
        };
        var servers = server.launchServer("localhost", ports, options, io);
        request(servers.staticServer)
            .get("/")
            .expect(200)
            .end(function (err, res) {
                sinon.assert.called(clientsSpy);
                done();
            });
    });
});
describe("the canNavigate function Check", function () {

    var options = {
        ghostMode: {
            links: true
        },
        excludedFileTypes: defaultConfig.excludedFileTypes
    };

    describe("rejecting/accepting requests", function () {
        var req;
        beforeEach(function () {
            req = {
                method: "GET",
                url: "/upload",
                headers: {}
            };
        });
        it("should return false for files in excluded list", function () {
            req.url = "/core.css";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return false for POST requests", function () {
            req.method = "POST";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return false for PUT requests", function () {
            req.method = "PUT";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return false for PATCH requests", function () {
            req.method = "PATCH";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return false for DELETE requests", function () {
            req.method = "DELETE";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return true when url is NOT iun exluded list", function () {
            req.url = "/app";
            var actual = canNavigate(req, options);
            assert.isTrue(actual);
        });
        it("should return TRYE when url is NOT in exluded list", function () {
            req.url = "/";
            var actual = canNavigate(req, options);
            assert.isTrue(actual);
        });
        it("should return FALSE when ghostMode Links disabled", function () {
            options.ghostMode.links = false;
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
        it("should return false for AJAX requests", function () {
            req.headers["x-requested-with"] = "XMLHttpRequest";
            var actual = canNavigate(req, options);
            assert.isFalse(actual);
        });
    });
});