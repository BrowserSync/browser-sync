describe("Internal Event Emitter", function () {

    var emitter = window.__bs_emitter__;

    beforeEach(function () {
        emitter.events = {};
    });

    it("should have a `on` method", function () {
        assert.equal(typeof emitter.on, "function");
    });
    it("should have a `emit` method", function () {
        assert.equal(typeof emitter.emit, "function");
    });

    describe("Adding events", function () {
        it("should add a listener and call it ", function () {
            var spy = sinon.spy();

            emitter.on("test", spy);
            emitter.emit("test", {data: "test data"});

            sinon.assert.calledOnce(spy);
        });
        it("should add two listeners and call them both", function () {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            emitter.on("test2", spy1);
            emitter.on("test2", spy2);

            emitter.emit("test2", {data: "test data"});

            sinon.assert.calledOnce(spy1);
            sinon.assert.calledOnce(spy2);
        });
    });
});