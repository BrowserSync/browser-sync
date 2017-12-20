describe("The scroll Plugin", function () {

    var toggles   = window.__bs_toggles__;
    var bs      = __bs_stub__;
    var events  = __bs_events__;

    var socketStub, socketStubEmit;

    before(function () {
        socketStub = sinon.spy(bs.socket, "on");
        socketStubEmit = sinon.spy(bs.socket, "emit");
    });
    afterEach(function () {
        socketStub.reset();
        socketStubEmit.reset();
    });
    after(function () {
        socketStub.restore();
        socketStubEmit.restore();
    });

    describe("Init:", function(){
        var eventStub, browserEventStub, socketEventStub;
        before(function () {
            eventStub = sinon.stub(toggles, "addEvents");
            browserEventStub = sinon.stub(toggles, "browserEvent").returns("browserEvent");
            socketEventStub  = sinon.stub(toggles, "socketEvent").returns("socketEvent");
        });
        after(function () {
            eventStub.restore();
            browserEventStub.restore();
            socketEventStub.restore();
        });
        beforeEach(function () {
            toggles.init(bs, events);
        });
        it("should register browser events", function () {
            sinon.assert.calledWithExactly(eventStub, events, "browserEvent");
        });
        it("should add socket Event", function() {
            var args = socketStub.getCall(0).args;
            assert.equal(args[0], "input:toggles");
            assert.equal(args[1], "socketEvent");
        });
        it("should call browserEvent with BS object", function () {
            sinon.assert.calledWithExactly(browserEventStub, bs);
        });
        it("should call browserEvent with BS object", function () {
            sinon.assert.calledWithExactly(socketEventStub, bs, events);
        });
    });

    describe("browserEvent(): ", function(){
        var dataStub, eventMock;
        before(function(){
            dataStub = sinon.stub(bs.utils, "getElementData").returns({
                tagName: "INPUT",
                index: 0
            });
        });
        beforeEach(function(){
            eventMock = {
                target: {
                    tagName: "INPUT",
                    value: 1,
                    type: "radio"
                }
            };
        });
        after(function () {
            dataStub.restore();
        });
        it("should return a function", function(){
            var func = toggles.browserEvent();
            assert.equal(typeof func === "function", true);
        });
        it("should emit the event if element type is radio", function () {
            var func = toggles.browserEvent(bs);
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "input:toggles", {
                tagName: "INPUT",
                index: 0,
                type: "radio",
                value: 1,
                checked: undefined
            });
        });
        it("should emit the event if element type is checkbox", function () {
            var func = toggles.browserEvent(bs);
            eventMock.target.type = "checkbox";
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "input:toggles", {
                tagName: "INPUT",
                index: 0,
                type: "checkbox",
                value: 1,
                checked: undefined
            });
        });
        it("should emit the event if element type is select", function () {
            var func = toggles.browserEvent(bs);
            dataStub.returns({
                tagName: "SELECT",
                index: 0
            });
            eventMock.target.tagName = "SELECT";
            eventMock.target.type = "select";
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "input:toggles", {
                tagName: "SELECT",
                index: 0,
                type: "select",
                value: 1,
                checked: undefined
            });
        });
        it("should not emit the event if disabled & reset the flag", function () {
            toggles.canEmitEvents = false;
            var func = toggles.browserEvent(bs);
            func(eventMock);
            sinon.assert.notCalled(socketStubEmit);
            assert.equal(toggles.canEmitEvents, true);
        });
    });
    describe("socketEvent(): ", function(){
        var func, elementStub;
        before(function () {
            func = toggles.socketEvent(bs);
            elementStub = sinon.stub(bs.utils, "getSingleElement").returns({});
        });
        afterEach(function () {
            elementStub.reset();
        });
        after(function () {
            elementStub.restore();
        });
        it("should return a function", function(){
            assert.equal(typeof func === "function", true);
        });
        it("should return false if cannot sync", function () {
            var canSyncStub = sinon.stub(bs, "canSync").returns(false);
            var actual = func({value: "kittie"});
            assert.equal(actual, false);
            canSyncStub.restore();
        });
        it("should set the value of the radio element", function () {
            var actual = func({type: "radio"});
            assert.equal(actual.checked, true);
        });
        it("should set the value of the checkbox element", function () {
            var actual = func({type: "checkbox", checked: "dummy"});
            assert.equal(actual.checked, "dummy");
        });
        it("should set the value of the SELECT element", function () {
            var actual = func({tagName: "SELECT", value: true});
            assert.equal(actual.value, true);
        });
    });
});