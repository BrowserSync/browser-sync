var browserSync = require("../../../");
var assert = require("chai").assert;
var File = require("vinyl");
var sinon = require("sinon");

describe("API: .stream() noop", function() {
    before(function() {
        browserSync.reset();
    });

    it("should can handle a reload + stream call when there's no instance", function() {
        assert.doesNotThrow(function() {
            var stream = browserSync.stream();
            stream.write(new File({ path: "styles.css" }));
            stream.end();
        });
    });
    it("should can handle a reload + stream call after there IS an instance", function(done) {
        var emitterStub;
        var scheduler = require("../../utils").getScheduler();
        var bs = browserSync({ debug: { scheduler: scheduler } }, function(
            err,
            _bs
        ) {
            var stream = bs.stream();

            emitterStub = sinon.spy(_bs.emitter, "emit");

            stream.write(new File({ path: "styles.css" }));
            stream.end();

            scheduler.advanceTo(600);

            sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                path: "styles.css",
                basename: "styles.css",
                log: false,
                namespace: "core",
                event: "change",
                ext: "css"
            });
            _bs.cleanup(done);
        });
    });
});
