/*jshint -W079 */
var browserSync = require("browser-sync");
var bsui        = require("../../../index");
var assert      = require("chai").assert;
var request     = require("supertest");

describe.skip("Remote debug - No cache", function () {

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
    it("should disable browser cache with middlewares", function (done) {

        var target = ui.options.getIn(["remote-debug", "no-cache"]).toJS();

        assert.equal(target.active, false);

        ui.noCache.toggle(true);

        target = ui.options.getIn(["remote-debug", "no-cache"]).toJS();

        assert.equal(target.active, true);

        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {

                assert.equal(res.headers["cache-control"], "no-cache, no-store, must-revalidate");
                assert.equal(res.headers["pragma"], "no-cache");
                assert.equal(res.headers["expires"], 0);

                ui.noCache.toggle(false);

                request(bs.server)
                    .get("/")
                    .set("accept", "text/html")
                    .expect(200)
                    .end(function (err, res) {

                        assert.notInclude(res.headers["cache-control"], "no-cache");
                        assert.notInclude(res.headers["pragma"], "no-cache");
                        assert.notInclude(res.headers["expires"], 0);

                        ui.noCache.toggle(false);

                        done();
                    });
            });
    });
});