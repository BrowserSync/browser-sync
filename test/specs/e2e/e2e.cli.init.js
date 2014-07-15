"use strict";

var browserSync = require("../../../index");
var config      = require("../../../lib/config");

var fs      = require("fs");
var path    = require("path");
var _       = require("lodash");
var assert  = require("chai").assert;
var spawn   = require("child_process").spawn;

var index   = path.resolve( __dirname + "/../../../index.js");

describe("E2E INIT test", function () {

    var bs;

    it("can serve the script", function (done) {
        bs = spawn(index, ["init"], {stdio: "inherit"}).on("close", function () {
            fs.unlink(process.cwd() + config.userFile, done);
        });
    });

});
