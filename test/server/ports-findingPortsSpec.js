var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var assert = require("chai").assert;
var sinon = require("sinon");
var _ = require("lodash");

var browserSync = new bs();
var options = bs.options;

describe("finding available ports (1)", function () {

    var ports;

    beforeEach(function (done) {
        browserSync.getPorts(3, function (result) {
            ports = result;
            done();
        });
    });

    it("should return the correct number of ports (1)", function () {
        assert.equal(3, ports.length);
    });

    it("should return unique ports", function(){
        var actual = _.uniq(ports);
        assert.equal(3, actual.length);
    });
});

describe("finding available ports (2)", function () {

    var ports;

    beforeEach(function (done) {
        browserSync.getPorts(4, function (result) {
            ports = result;
            done();
        });
    });

    it("should return the correct number of ports (2)", function () {
        assert.equal(4, ports.length);
    });

    it("should return unique ports (2)", function(){
        var actual = _.uniq(ports);
        assert.equal(4, actual.length);
    });
});