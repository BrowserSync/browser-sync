var browserSync = require("../../../../");
var assert = require("chai").assert;
var utils = require("../../../utils");
var Rx = require("rx");

describe("E2E server test with extension option", function() {
    it("serves using 'extensions'", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            extensions: ["html"],
            snippetOptions: {
                blacklist: ["/forms"]
            },
            logLevel: "silent",
            open: false
        };

        browserSync.create().init(config, function(err, bs) {
            assert.equal(
                bs.options.getIn([
                    "server",
                    "serveStaticOptions",
                    "extensions",
                    0
                ]),
                "html"
            );
            var reqs = utils.getRequests(
                [
                    [
                        "/forms",
                        require("fs").readFileSync(
                            "test/fixtures/forms.html",
                            "utf-8"
                        )
                    ]
                ],
                bs.server
            );
            Rx.Observable.concat(reqs).subscribeOnCompleted(function() {
                bs.cleanup();
                done();
            });
        });
    });
});
