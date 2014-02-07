var bs = require("../../../lib/browser-sync");
var messages = require("../../../lib/messages");
var portScanner = require("../../../lib/ports");
var events = require("events");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;

describe("Browser Sync INIT", function () {

    var files = ["**/*.css"],
        getPortRange,
        getPorts,
        portRange = {
            min: 3000,
            max: 4000
        },
        startServices,
        getPortsCallback,
        func,
        fail;

    before(function () {

        startServices = sinon.stub(browserSync, "startServices");
        getPortsCallback = sinon.stub(browserSync, "getPortsCallback");
        getPortRange  = sinon.stub(portScanner, "getPortRange");
        getPorts      = sinon.stub(portScanner, "getPorts");
        fail      = sinon.stub(browserSync, "fail");

        startServices.returns(true);
        getPorts.returns(true);
        getPortRange.returns(portRange);

        func = function () {};
        getPortsCallback.returns(func);
    });

    afterEach(function () {
        getPortRange.reset();
        startServices.reset();
        getPortsCallback.reset();
        getPorts.reset();
        fail.reset();
    });

    after(function () {
        startServices.restore();
        getPortRange.restore();
        getPortsCallback.restore();
        getPorts.restore();
        fail.restore();
    });

    describe("returning event emitter", function () {
        it("should return the event emitter", function () {
            var options = {
                ports: portRange
            };
            var bs = browserSync.init(files, options);
            assert.instanceOf(bs, events.EventEmitter);
        });
    });

    describe("Setting up servers with correct config", function () {
        it("should call get ports when port range provided in options (with no server or proxy)", function(){
            var options = {
                ports: portRange
            };
            browserSync.init(files, options);
            var actual = getPorts.calledWithExactly(2, func, portRange.min, portRange.max);
            assert.equal(actual, true);
        });
        it("should call get ports when port range provided in options (with server)", function(){
            var options = {
                ports: portRange,
                server: true
            };
            browserSync.init(files, options);
            var actual = getPorts.calledWithExactly(3, func, portRange.min, portRange.max);
            assert.equal(actual, true);
        });
        it("should call get ports when port range provided in options (with proxy)", function(){
            var options = {
                ports: portRange,
                proxy: true
            };
            browserSync.init(files, options);
            var actual = getPorts.calledWithExactly(3, func, portRange.min, portRange.max);
            assert.equal(actual, true);
        });
        it("should call fail() if both server & proxy supplied", function () {
            sinon.stub(messages.server, "withProxy").returns("SERVER ERROR");
            var options = {
                server: true,
                proxy: true
            };
            browserSync.init(files, options);
            sinon.assert.calledWithExactly(fail, "SERVER ERROR", options, true);
        });

        it("should call fail() when ports invalid", function () {
            sinon.stub(messages.ports, "invalid").returns("ERROR");
            getPortRange.returns(false);
            var options = {
                ports: {
                    min: 2000,
                    max: 2001
                }
            };
            browserSync.init(files, options);
            sinon.assert.calledWithExactly(fail, "ERROR", options, true);
        });

        it("should call getPortRange() with user specified ports when provided in options.", function(){
          var options = {
              ports: {
                  min: 6000,
                  max: 6100
              }
          };
          browserSync.init(files, options);
          var actual = getPortRange.calledWithExactly(2, options.ports.min, options.ports.max);
          assert.equal(actual, true);
      });
    });
});