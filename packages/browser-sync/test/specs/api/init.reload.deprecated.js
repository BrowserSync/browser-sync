var sinon = require("sinon");
var assert = require("chai").assert;

describe("API: .reload() old signature", function() {
    delete require.cache[require.resolve("../../../")];
    var browserSync = require("../../../");

    var emitterStub, clock;

    before(function() {
        emitterStub = sinon.spy(browserSync.emitter, "emit");
        clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        emitterStub.reset();
        clock.now = 0;
    });

    after(function() {
        clock.restore();
        emitterStub.restore();
    });

    it("should handle a reload call without running instance", function() {
        assert.doesNotThrow(function() {
            browserSync.reload({ stream: true });
        });
    });
});
