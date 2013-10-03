var fs = require("fs");
var si = require("../../lib/style-injector");
var methods = new si();
var options = si.options;
var testFile = "test/fixtures/test.txt";


// socket io stub;


describe("watching files", function () {

    var io;

    beforeEach(function(){
        spyOn(methods, "changeFile");
        beforeEach(function(){
        });
        var io = {};
        io.sockets = {
            emit: function (event, data) {}
        };
    });

    it("should call changeFile when a watched file is changed", function () {

        methods.watchFiles(testFile, io, methods.changeFile, {});

        setTimeout(function () {
            fs.writeFileSync(testFile, "writing to file", "UTF-8");
        }, 200);

        waits(600);

        runs(function () {
            expect(methods.changeFile).toHaveBeenCalled();
        });
    });
});