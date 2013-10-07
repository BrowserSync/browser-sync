var si = require("../../lib/style-injector");
var messages = require("../../lib/messages");

var methods = new si();

var options = si.options;

describe("finding free ports", function () {

    it("should return ports two available ports", function () {

        var cb = jasmine.createSpy();

        var ports = methods.getPorts(2, cb, {});

        waits(100);

        runs(function () {
            expect(cb).toHaveBeenCalledWith([3000, 3001]);
        });
    });
});