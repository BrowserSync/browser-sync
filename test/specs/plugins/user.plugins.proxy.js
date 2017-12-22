var browserSync = require("../../../");
var testUtils = require("../../protractor/utils");
var Immutable = require("immutable");
var sinon = require("sinon");
var request = require("supertest");

describe("Plugins: Should be able to register middleware when in proxy mode", function() {
    var app;
    var spy;

    it("should serve the file", function(done) {
        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({ scheme: "http" }));
        app.server.listen();

        spy = sinon.spy();

        var config = {
            proxy: "http://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent"
        };

        browserSync.use({
            plugin: function() {
                /* noop */
            },
            hooks: {
                "server:middleware": function() {
                    return function(req, res, next) {
                        spy();
                        next();
                    };
                }
            },
            "plugin:name": "KITTENZ"
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/")
                .set("accept", "text/html")
                .end(function() {
                    sinon.assert.called(spy);
                    bs.cleanup();
                    done();
                });
        });
    });
});
