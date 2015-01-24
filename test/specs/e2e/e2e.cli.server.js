//"use strict";
//
//var request = require("supertest");
//var server  = require("./commands.server.json");
//var assert  = require("chai").assert;
//var exec    = require("child_process").execFile;
//
//describe.only("E2E CLI server test", function () {
//
//    var bs, options;
//
//    before(function (done) {
//        bs = exec(__dirname + "/../../../bin/browser-sync.js", ["init"], function (err, out) {
//            //console.log(err.message);
//            console.log(out);
//            done();
//        });
//        bs.emit("end");
//    });
//
//    it("returns the snippet", function (done) {
//
//        //console.log("HERE");
//        done();
//        //request(options.urls.local)
//        //    .get(options.scriptPaths.versioned)
//        //    .expect(200)
//        //    .end(function (err, res) {
//        //        assert.include(res.text, "Connected to BrowserSync");
//        //        done();
//        //    });
//    });
//
//    //it("Can serve files", function (done) {
//    //    request(options.urls.local)
//    //        .get("/")
//    //        .expect(200)
//    //        .end(function (err, res) {
//    //            assert.include(res.text, "BrowserSync + Public URL");
//    //            done();
//    //        });
//    //});
//    //
//    //it("Can serve files with snippet added", function (done) {
//    //    request(options.urls.local)
//    //        .get("/")
//    //        .set("accept", "text/html")
//    //        .expect(200)
//    //        .end(function (err, res) {
//    //            assert.include(res.text, options.snippet);
//    //            done();
//    //        });
//    //});
//});
