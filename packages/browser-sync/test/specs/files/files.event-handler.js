var Rx = require("rx");
var onNext = Rx.ReactiveTest.onNext;
var Immutable = require("immutable");
var fromJS = Immutable.fromJS;
var assert = require("chai").assert;
var injectFileTypes = require("../../../dist/default-config").injectFileTypes;
var handler = require("../../../dist/file-event-handler").fileChanges;

describe("globally handling fle:changed events", function() {
    it("takes an observable + options", function() {
        var s = new Rx.TestScheduler();
        var options = fromJS({
            watchEvents: ["add", "change"],
            reloadDebounce: 100,
            debug: { scheduler: s },
            injectFileTypes: injectFileTypes
        });
        var obs = s.createHotObservable(
            onNext(200, { event: "change", path: "core.css" }),
            onNext(201, { event: "change", path: "other.css" }),
            onNext(203, { event: "change", path: "core.css" }),

            onNext(403, { event: "change", path: "core3.php" }),
            onNext(404, { event: "change", path: "core4.php" }),
            onNext(405, { event: "change", path: "core5.php" }),

            onNext(1003, { event: "change", path: "core6.css" }),
            onNext(1004, { event: "add", path: "core7.css" }),
            onNext(1005, { event: "change", path: "core8.php" })
        );
        var res = s.startScheduler(
            function() {
                return handler(obs, options);
            },
            { created: 0, subscribed: 0, disposed: 3000 }
        );

        assert.equal(res.messages[0].time, 303);
        assert.equal(res.messages[1].time, 505);
        assert.equal(res.messages[2].time, 1105);
    });
    it("takes an observable + options with delay", function() {
        var s = new Rx.TestScheduler();
        var options = fromJS({
            watchEvents: ["add", "change"],
            reloadDebounce: 100,
            reloadDelay: 1000,
            debug: { scheduler: s },
            injectFileTypes: injectFileTypes
        });
        var obs = s.createHotObservable(
            onNext(200, { event: "change", path: "core.css" }),
            onNext(201, { event: "change", path: "other.css" }),
            onNext(203, { event: "change", path: "core.css" })
        );
        var res = s.startScheduler(
            function() {
                return handler(obs, options);
            },
            { created: 0, subscribed: 0, disposed: 3000 }
        );

        assert.equal(res.messages[0].time, 1303);
    });
});
