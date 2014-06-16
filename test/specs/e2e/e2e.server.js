//"use strict";
//
//var browserSync   = require("../../../lib/index");
//
//var sinon   = require("sinon");
//var request = require("supertest");
//var assert  = require("chai").assert;
//
//describe("E2E server test", function () {
//
//    var options;
//    var instance;
//    var server;
//
//    before(function (done) {
//
//        var config = {
//            server: {
//                baseDir: __dirname + "/../../fixtures"
//            },
//            debugInfo: false,
//            open: false
//        };
//
//        browserSync.init(config, function (err, bs) {
//            options  = bs.options;
//            server   = bs.servers.staticServer;
//            instance = bs;
//
//            done();
//        });
//    });
//
//    after(function () {
//        server.close();
//    });
//
//    it("returns the snippet", function (done) {
//
//        assert.isString(options.snippet);
//
//        request(server)
//            .get("/index.html")
//            .set("accept", "text/html")
//            .expect(200, done)
//            .end(function (err, res) {
//                assert.isTrue(res.text.indexOf("browser-sync-client") > -1);
//                done();
//            });
//    });
////    it("Can return the script", function (done) {
////
////        request(server)
////            .get(options.scriptPath)
////            .expect(200)
////            .end(function (err, res) {
////                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
////                done();
////            });
////    });
//});