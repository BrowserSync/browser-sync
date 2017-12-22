var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Setting options during runtime", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        instance = browserSync({ logLevel: "silent" }, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("should update options with event", function(done) {
        instance.events.on("options:set", function(data) {
            assert.deepEqual(
                instance.options.getIn(["ghostMode", "clicks"]),
                false
            );
            assert.deepEqual(data.path, ["ghostMode", "clicks"]);
            assert.deepEqual(data.value, false);
            assert.deepEqual(
                data.options.getIn(["ghostMode", "clicks"]),
                false
            );
            done();
        });

        instance.setOptionIn(["ghostMode", "clicks"], false);
    });
});

describe("Setting Multi options during runtime", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        instance = browserSync({ logLevel: "silent" }, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("should update options with event", function(done) {
        instance.events.on("options:set", function() {
            assert.deepEqual(
                instance.options.getIn(["ghostMode", "clicks"]),
                false
            );
            assert.deepEqual(instance.options.getIn(["shane"]), "awesome");
            done();
        });

        instance.setMany(function(item) {
            item.setIn(["ghostMode", "clicks"], false);
            item.setIn(["shane"], "awesome");
        });
    });
});
