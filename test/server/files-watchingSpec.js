var fs = require("fs");
var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var options = bs.options;
var assert = require("chai").assert;
var sinon = require("sinon");

var testFile1 = "test/fixtures/test.txt";
var testFile2 = "test/fixtures/test2.txt";

describe("watching files", function () {

    var logSpy, changeFileSpy;

    before(function () {
        logSpy = sinon.spy(browserSync, "log");
        changeFileSpy = sinon.spy();
    });

    afterEach(function () {
        logSpy.reset();
        changeFileSpy.reset();
    });

    it("should call changeFile when a watched file is changed (1)", function (done) {

        browserSync.watchFiles(testFile1, {}, changeFileSpy, {}, 100);

        setTimeout(function () {

            fs.writeFileSync(testFile1, "writing to file");

            setTimeout(function () {
                var call   = changeFileSpy.getCall(0);
                var actual = call.args[0];
                assert.isTrue(actual.indexOf(testFile1) >= 0);
                done();
            }, 600);

        }, 200);
    });
    it("should call changeFile when a watched file is changed (1)", function (done) {

        browserSync.watchFiles(testFile2, {}, changeFileSpy, {}, 100);

        setTimeout(function () {

            fs.writeFileSync(testFile2, "writing to file");

            setTimeout(function () {
                var call   = changeFileSpy.getCall(0);
                var actual = call.args[0];
                assert.isTrue(actual.indexOf(testFile2) >= 0);
                done();
            }, 600);

        }, 200);
    });
});