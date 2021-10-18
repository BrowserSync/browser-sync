const browserSync = require("../../../../");

const assert = require("chai").assert;
const request = require('superagent');
// N.B. use superagent directly (rather than supertest) in these tests
// because supertest doesn't support http2 - see: https://github.com/visionmedia/supertest/pull/691

describe("E2E httpModule options test", function() {

    function doHttpModuleTest(httpModule, done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            https: true,
            httpModule,
            open: false,
            logLevel: "silent"
        };

        browserSync.init(config, function(err, bs) {
            const host = bs.options.getIn(["urls", "local"]);
            request
                .get(`${host}/index.html`)
                .trustLocalhost()
                .http2()
                .set("accept", "text/html")
                .then(res => {
                    assert.strictEqual(res.status, 200);
                    assert.include(res.text, bs.options.get("snippet"));
                    done();
                })
                .catch(err => {
                    console.log(err);
                    return done(err);
                })
                .finally(() => {
                    bs.cleanup();
                });
        });
    }

    // older versions of node didn't include a native http2 module, so test
    // the molnarg/http2 module is still supported:
    it("creates server using non-native http2 module", function(done) {
        doHttpModuleTest('../../node_modules/http2', done);
    });

    it("creates server using native http2 module", function(done) {
        doHttpModuleTest('http2', done);
    });
});
