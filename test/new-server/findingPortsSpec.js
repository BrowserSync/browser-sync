var si = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var _ = require("lodash");

var methods = new si();

var options = si.options;

describe("finding free ports", function () {

    it("should return ports three available ports", function () {

        var cb = jasmine.createSpy();

        var ports = methods.getPorts(3, cb, {});

        waitsFor(function () {
            return cb.callCount > 0;
        }, "took too long to get ports", 10000);

        runs(function () {

            var arg1 = cb.mostRecentCall.args[0][0];
            var arg2 = cb.mostRecentCall.args[0][1];
            var arg3 = cb.mostRecentCall.args[0][2];

            expect(/^(\d){4}$/.test(arg1)).toBe(true);
            expect(/^(\d){4}$/.test(arg2)).toBe(true);
            expect(/^(\d){4}$/.test(arg3)).toBe(true);

            expect(_.uniq([arg1, arg2, arg3]).length).toBe(3);

        });
    });
});