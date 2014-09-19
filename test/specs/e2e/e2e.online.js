"use strict";

var browserSync = require("../../../index");
var utils       = require("../../../lib/utils");

var assert      = require("chai").assert;
var sinon       = require("sinon");
var dns         = require("dns");

describe("E2E online test", function () {
    var stub;
    before(function () {
//        stub  = sinon.stub(process, "exit");
    });
    after(function () {
//        stub.restore();
    });
    it("Sets `online: false` if google.com lookup fails", function (done) {

        var stub = sinon.stub(dns, "resolve").yields("ERR");
        var instance = browserSync({
            open: false
        }, function (err, bs) {
            assert.isFalse(bs.options.online);
            instance.cleanup();
            stub.restore();
            done();
        });
    });
});
