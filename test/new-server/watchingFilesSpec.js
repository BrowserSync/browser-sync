var fs = require("fs");
var si = require("../../lib/browser-sync");
var methods = new si();
var options = si.options;
var testFile1 = "test/fixtures/test.txt";
var testFile2 = "test/fixtures/index.html";

describe("watching files", function () {

    var io;

    beforeEach(function(){

        spyOn(methods, "changeFile");
        spyOn(methods, "log");

        beforeEach(function(){
        });

        var io = {};

        io.sockets = {
            emit: function (event, data) {}
        };
    });

    it("should call changeFile when a watched file is changed", function () {

        methods.watchFiles(testFile1, io, methods.changeFile, {});

        setTimeout(function () {
            fs.writeFileSync(testFile1, "writing to file", "UTF-8");
        }, 200);

        waits(600);

        runs(function () {
            expect(methods.changeFile).toHaveBeenCalled();
        });
    });
});