describe("Ghostmode: clicks", function () {

    var browserSync;
    var ghost;
    var mockEvent;
    var scope = {
        ghostMode: {
        }
    };
    var emitSpy;
    var indexStub;

    beforeEach(function () {
        browserSync = window.BrowserSync;
        ghost = window.ghost;
        emitSpy = sinon.spy(ghost, "emitEvent");
        indexStub = sinon.stub(Array.prototype, "indexOf").returns(1);
        mockEvent = {
            target: document.createElement("div")
        };
        scope.ghostMode.enabled = true;
    });

    afterEach(function () {
        emitSpy.restore();
        indexStub.restore();
    });

    it("should not emit an event if scope.ghostMode is disabled", function() {
        scope.ghostMode.enabled = false;
        ghost.listeners.click(mockEvent, scope);
        sinon.assert.notCalled(emitSpy);
    });
    it("should not emit an event if the element clicked on was an input", function() {
        mockEvent.target = document.createElement("input");
        mockEvent.target.type = "checkbox";
        ghost.listeners.click(mockEvent, scope);
        sinon.assert.notCalled(emitSpy);
    });
    it("should emit an event if scope.ghostMode is enabled", function() {
        ghost.listeners.click(mockEvent, scope);
        sinon.assert.called(emitSpy, "click", {tagName: "DIV", index: 1});
    });
});
