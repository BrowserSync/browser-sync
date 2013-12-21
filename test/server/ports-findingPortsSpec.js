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

describe("finding available ports with min/mx", function () {

    var ports;

    beforeEach(function (done) {
        browserSync.getPorts(4, function (result) {
            ports = result;
            done();
        }, 4000, 4004);
    });

    it("should return the correct number of ports (2)", function () {
        assert.equal(ports[0], 4000);
    });

    it("should return unique ports (2)", function(){
        var actual = _.uniq(ports);
        assert.equal(4, actual.length);
    });
});

describe("resolving ports range", function () {

    options;

    beforeEach(function () {
        options = {};
    });

    it("should return the default range if not given in options", function () {
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 3000);
        assert.equal(actual.max, 4000);
    });
    it("should return the correct range when given in options", function () {
        options = {
            ports: {
                min: 5000,
                max: 5100
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 5000);
        assert.equal(actual.max, 5100);
    });
    it("should not throw if range is not too small", function () {
        options = {
            ports: {
                min: 5000,
                max: 5002
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 5000);
        assert.equal(actual.max, 5002);
    });
    it("should return false if range is too small", function () {
        options = {
            ports: {
                min: 5000,
                max: 5001
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual, false);
    });
    it("should use a default for MAX if only min given", function () {
        options = {
            ports: {
                min: 5000
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 5000);
        assert.equal(actual.max, 5500);
    });
    it("should MAX out at 9999 (1)", function () {
        options = {
            ports: {
                min: 9980
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 9980);
        assert.equal(actual.max, 9999);
    });
    it("should MAX out at 9999 (2)", function () {
        options = {
            ports: {
                min: 9600
            }
        };
        var actual = browserSync.getPortRange(3, options);
        assert.equal(actual.min, 9600);
        assert.equal(actual.max, 9999);
    });
});