var browserSync = require("../../../");

var request = require("supertest");
var page = require("fs").readFileSync("test/fixtures/index.html", "utf-8");
var css = require("fs").readFileSync("test/fixtures/assets/style.css", "utf-8");
var Rx = require("rx");

function getRequests(reqs, server) {
    return reqs.map(function(req) {
        return Rx.Observable.create(function(obs) {
            request(server)
                .get(req[0])
                .end(function(err, res) {
                    if (err) {
                        return obs.onError(err);
                    }
                    if (res.text === req[1]) {
                        obs.onNext(true);
                        obs.onCompleted();
                        return;
                    }

                    obs.onError(
                        new Error(req[0] + " did not match the response body")
                    );
                });
        });
    });
}

describe("E2E `serveStatic` option", function() {
    it("can serve static files with string only", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: ["test/fixtures"]
        };
        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/index.html")
                .expect(200, page, function() {
                    bs.cleanup();
                    done();
                });
        });
    });
    it("can serve static files with string multiple string", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: ["test/fixtures", "test/fixtures/assets"]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [["/index.html", page], ["/style.css", css]],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
    it("can serve static files with multiple objects", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: [
                { route: "", dir: "test/fixtures" },
                { route: [""], dir: "test/fixtures/assets" }
            ]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [["/index.html", page], ["/style.css", css]],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
    it("can serve static files with multiple roots", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: [
                { route: "", dir: "test/fixtures" },
                { route: ["/shane", "/kittie"], dir: "test/fixtures/assets" },
                { route: "", dir: "test/fixtures/assets" }
            ]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [
                    ["/index.html", page],
                    ["/shane/style.css", css],
                    ["/kittie/style.css", css]
                ],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
    it("can serve static files with multiple dirs", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: [
                { route: "", dir: ["test/fixtures", "test/fixtures/assets"] }
            ]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [["/index.html", page], ["/style.css", css]],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
    it("can serve static files with dir + NO route", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: [{ dir: ["test/fixtures", "test/fixtures/assets"] }]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [["/index.html", page], ["/style.css", css]],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
    it("can serve static files with mix of inputs", function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online: false,
            serveStatic: [
                "test/fixtures",
                { dir: ["test/fixtures/assets"] },
                { route: "shane", dir: ["test/fixtures"] },
                { route: ["shane", "kittie"], dir: ["test/fixtures"] }
            ]
        };
        browserSync(config, function(err, bs) {
            var reqs = getRequests(
                [
                    ["/index.html", page],
                    ["/style.css", css],
                    ["/shane/index.html", page],
                    ["/kittie/assets/style.css", css]
                ],
                bs.server
            );
            var obs = Rx.Observable.merge(reqs);
            obs.subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
});
