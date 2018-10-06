var info = require("../../../dist/cli/cli-info");

var assert = require("chai").assert;
var sinon = require("sinon");
var fs = require("fs");

describe("CLI: Info Helpers:", function() {
    describe("When displaying the version number", function() {
        var consoleLogStub;
        before(function() {
            consoleLogStub = sinon.spy(console, "log");
        });
        after(function() {
            console.log.restore();
        });
        it("should be a function", function() {
            assert.isDefined(info);
        });
        it("should have a getVersion method", function() {
            assert.isDefined(info.getVersion);
        });
        it("should return the correct version number (1)", function() {
            var pjson = {
                version: "2.0"
            };
            var actual = info.getVersion(pjson);
            assert.equal(actual, "2.0");
        });
        it("should return the correct version number (2)", function() {
            var pjson = {
                version: "3.0"
            };
            var actual = info.getVersion(pjson);
            assert.equal(actual, "3.0");
        });
        it("should log the version to the console", function() {
            var pjson = {
                version: "3.0"
            };
            info.getVersion(pjson);
            sinon.assert.calledWithExactly(consoleLogStub, "3.0");
        });
    });

    describe("When creating the config file:", function() {
        var readStub;
        var writeStub;
        var consoleStub;

        before(function() {
            readStub = sinon.stub(fs, "readFileSync").returns("DATA");
            writeStub = sinon.stub(fs, "writeFile").yields(null);
            consoleStub = sinon.spy(console, "log");
        });
        after(function() {
            fs.writeFile.restore();
            fs.readFileSync.restore();
            console.log.restore();
        });
        it("should call the readFileSync method", function(done) {
            info.makeConfig("/Users/shakyshane", function() {
                sinon.assert.called(readStub);
                done();
            });
        });
    });
});
