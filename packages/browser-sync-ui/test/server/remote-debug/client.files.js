/*jshint -W079 */
var browserSync = require("browser-sync");
var request     = require("supertest");
var assert      = require("chai").assert;

describe("Remote debug", function () {

    var bs, ui;

    this.timeout(10000);

    before(function (done) {

        browserSync.reset();
        browserSync.use(require("../../../index"));

        var config = {
            online: false,
            open: false,
            server: "test/fixtures",
            logLevel: "silent"
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
    it("should enable a file & allow BrowserSync to serve it", function (done) {

        var cssFile = ui.options.getIn(["clientFiles", "pesticide"]).toJS();

        ui.enableElement(cssFile);

        request(bs.server)
            .get(cssFile.src)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "1px solid #3498db");
                done();
            });
    });
});