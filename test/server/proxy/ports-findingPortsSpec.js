var bs = require("../../../lib/browser-sync");
var messages = require("../../../lib/messages");
var portScanner = require("../../../lib/ports");
var assert = require("chai").assert;
var sinon = require("sinon");
var _ = require("lodash");

var browserSync = new bs();
var options = bs.options;

describe("Finding available ports", function () {

    describe("finding available ports (1)", function () {

        var ports;

        beforeEach(function (done) {
            portScanner.getPorts(3, function (result) {
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
            portScanner.getPorts(4, function (result) {
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
            portScanner.getPorts(4, function (result) {
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

        var options;

        beforeEach(function () {
            options = {};
        });

        it("should return the default range if not given in options", function () {
            var actual = portScanner.getPortRange(3);
            assert.equal(actual.min, 3000);
            assert.equal(actual.max, 4000);
        });
        it("should return the correct range when given in options", function () {
            var min = 5000;
            var max = 5100;
            var actual = portScanner.getPortRange(3, min, max);
            assert.equal(actual.min, 5000);
            assert.equal(actual.max, 5100);
        });
        it("should not return false if range is not too small", function () {
            options = {
                ports: {
                    min: 5000,
                    max: 5002
                }
            };
            var actual = portScanner.getPortRange(3, options.ports.min, options.ports.max);
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
            var actual = portScanner.getPortRange(3, options.ports.min, options.ports.max);
            assert.equal(actual, false);
        });
        it("should use a default for MAX if only min given", function () {
            options = {
                ports: {
                    min: 5000
                }
            };
            var actual = portScanner.getPortRange(3, options.ports.min);
            assert.equal(actual.min, 5000);
            assert.equal(actual.max, 5500);
        });
        it("should MAX out at 9999 (1)", function () {
            options = {
                ports: {
                    min: 9980
                }
            };
            var actual = portScanner.getPortRange(3, options.ports.min);
            assert.equal(actual.min, 9980);
            assert.equal(actual.max, 9999);
        });
        it("should MAX out at 9999 (2)", function () {
            options = {
                ports: {
                    min: 9600
                }
            };
            var actual = portScanner.getPortRange(3, options.ports.min);
            assert.equal(actual.min, 9600);
            assert.equal(actual.max, 9999);
        });
    });

    describe("getting the ports Callback", function () {

        it("should return a function", function(){
            var actual = browserSync.getPortsCallback();
            assert.isFunction(actual);
        });

        describe("calling the returned function", function () {
            var files;
            var startServicesStub;
            var setup;
            var assignPortSpy;
            before(function () {
                files = ["**/*.css"];
                startServicesStub = sinon.stub(browserSync, "startServices");
                assignPortSpy = sinon.spy(browserSync, "assignPortNames");
                setup = function (ports, options) {
                    var portsCallback = browserSync.getPortsCallback(files, options);
                    portsCallback(ports);
                };
            });
            afterEach(function () {
                assignPortSpy.reset();
                startServicesStub.reset();
            });
            after(function () {
                startServicesStub.restore();
            });
            it("should call assignPortNames with NO server or proxy", function () {
                var options = {};
                var ports = [3000, 3001];
                var names = ["socket", "controlPanel"];
                setup(ports, options);
                sinon.assert.calledWithExactly(assignPortSpy, ports, names);
            });
            it("should call assignPortNames WITH server", function () {
                var options = {
                    server: true
                };
                var ports = [3000, 3001, 3002];
                var names = ["socket", "controlPanel", "server"];
                setup(ports, options);
                sinon.assert.calledWithExactly(assignPortSpy, ports, names);
            });
            it("should call assignPortNames WITH proxy", function () {
                var options = {
                    proxy: true
                };
                var ports = [3000, 3001, 3002];
                var names = ["socket", "controlPanel", "proxy"];
                setup(ports, options);
                sinon.assert.calledWithExactly(assignPortSpy, ports, names);
            });
            it("should call when called", function(){
                var options = {};
                var ports = [3000, 3001];
                setup(ports, options);
                sinon.assert.calledWithExactly(startServicesStub, {
                    ports: {
                        socket: 3000,
                        controlPanel: 3001
                    },
                    files: files,
                    options: options
                });
            });
        });
    });
});
