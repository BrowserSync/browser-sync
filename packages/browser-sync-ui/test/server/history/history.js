/*jshint -W079 */
var Immutable = require("immutable");
var history   = require("../../../lib/plugins/history/history");
var assert    = require("chai").assert;
var url       = require("url");

describe("Saving history", function () {
    it("Adding a new path", function () {
        var imm = Immutable.OrderedSet();
        var out = history.addPath(imm, url.parse("http://localhost/shane"), "server");
        assert.deepEqual(out.toJS(), ["/shane"]);
    });
    it("Adding a dupe path", function () {
        var imm = Immutable.OrderedSet();
        var out = history.addPath(imm, url.parse("http://localhost/"), "server");
        assert.deepEqual(out.toJS(), ["/"]);
    });
    it("Adding a path in snippet mode", function () {
        var imm = Immutable.OrderedSet();
        var out = history.addPath(imm, url.parse("http://localhost:65323/about.html"), "snippet");
        assert.deepEqual(out.toJS(), ["http://localhost:65323/about.html"]);
    });
    it("Can remove a path", function () {
        var imm = Immutable.OrderedSet(["/shane"]);
        var out = history.removePath(imm, "http://localhost/");
        assert.deepEqual(out.toJS(), ["/shane"]);
    });
    it("Can compare two maps", function () {
        var map1 = Immutable.Map({a:1, b:1, c:"1", d: Immutable.Map({hello:"shane"})});
        var map2 = Immutable.Map({a:1, b:1, c:"1", d: Immutable.Map({hello:"shane"})});
        assert.isTrue(Immutable.is(map1, map2));
    });
});