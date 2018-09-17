var browserSync = require("../../../");
var sinon = require("sinon");
var assert = require("chai").assert;

describe("E2E `logSnippet` option", function() {
    var instance;
    var spy;

    before(function(done) {
        browserSync.reset();

        var config = {
            online: false,
            open: false,
            logSnippet: false
        };

        spy = sinon.spy(console, "log");
        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
        console.log.restore();
    });

    it("Can set the log snippet when given in options", function() {
        var calls = spy.getCalls();
        var snippet = testString(
            "Copy the following snippet into your website"
        );
        var urls = testString("Access URLs");

        function testString(match) {
            return calls.filter(function(call) {
                return call.args.filter(function(arg) {
                    return arg.indexOf(match) > -1;
                }).length;
            });
        }

        assert.equal(snippet.length, 0);
        assert.equal(urls.length, 1);
    });
});
