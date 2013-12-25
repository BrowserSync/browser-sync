var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
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
        getPortRange  = sinon.stub(browserSync, "getPortRange");
        getPorts      = sinon.stub(browserSync, "getPorts");
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

    describe("Setting up servers with correct config", function () {
        it("should call get ports when port range provided in options", function(){
            var options = {
                ports: portRange
            };
            browserSync.init(files, options);
            var actual = getPorts.calledWith(browserSync.options.minPorts, func, portRange.min, portRange.max);
            assert.equal(actual, true);
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
            sinon.assert.calledWith(fail, "ERROR", options, true);
        });
    });
});