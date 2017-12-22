var browserSync = require("../../../");

var assert = require("chai").assert;
var request = require("supertest");

describe("E2E `socket` options", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            online: false,
            open: false,
            socket: {
                namespace: function() {
                    return "/shane";
                }
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("calls namespace fn when given in socket options", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "location.host + '/shane'");
                done();
            });
    });
});
