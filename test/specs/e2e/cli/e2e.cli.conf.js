"use strict";

var path        = require("path");
var browserSync = require(path.resolve("./"));
var pkg         = require(path.resolve("package.json"));
var assert      = require("chai").assert;
var sinon       = require("sinon");
var fs          = require("fs");
var cli         = require(path.resolve(pkg.bin));

// describe("CLI: merging package.json property with cli args", function () {
//     it("accepts key `browser-sync` from package.json", function (done) {
//         browserSync.reset();
//         cli({
//             cli: {
//                 input: ["start"],
//                 flags: {
//                     logLevel: "silent",
//                     open: false
//                 }
//             },
//             cb: function (err, bs) {
//                 assert.equal(bs.options.getIn(["server", "baseDir"]), "test/fixtures");
//                 bs.cleanup();
//                 done();
//             }
//         });
//     });
// });
