/*jshint -W079 */
var browserSync = require("browser-sync");
var bsui        = require("../../../index");
var request     = require("supertest");
var assert      = require("chai").assert;

describe.skip("Remote debug - Latency", function () {

    var bs, ui;

    this.timeout(10000);

    before(function (done) {

        browserSync.reset();

        browserSync.use(bsui);

        var config = {
            online: false,
            open: false,
            logLevel: "silent",
            server: "test/fixtures"
        };

        browserSync(config, function (err, out) {
            ui = out.ui;
            bs = out;
            done();
        });
    });
    after(function () {
        bs.cleanup();
    });
    it("should Init Latency plugin on/off", function (done) {

        var latency = ui.options.getIn(["remote-debug", "latency"]).toJS();
        assert.deepEqual(latency.rate, 0);
        assert.deepEqual(latency.active, false);

        ui.latency.toggle(true);
        latency = ui.options.getIn(["remote-debug", "latency"]).toJS();
        assert.deepEqual(latency.active, true);
        ui.latency.toggle(false);
        latency = ui.options.getIn(["remote-debug", "latency"]).toJS();
        assert.deepEqual(latency.active, false);

        done();
    });
    it("should adjust the throttle rate", function (done) {

        ui.latency.toggle(true);
        ui.latency.adjust({rate: 1.5});

        var time = new Date().getTime();

        request(bs.server)
            .get("/")
            .expect(200)
            .end(function () {
                assert.isTrue((new Date().getTime() - time) > 1500);
                done();
            });

    });
});