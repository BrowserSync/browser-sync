describe("The scroll Plugin", function () {

    var forms   = window.__bs_inputs__;
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
            eventStub = sinon.stub(events, "addEvent");
            browserEventStub = sinon.stub(forms, "browserEvent").returns("browserEvent");
            socketEventStub  = sinon.stub(forms, "socketEvent").returns("socketEvent");
        });
        after(function () {
            eventStub.restore();
            browserEventStub.restore();
            socketEventStub.restore();
        });
        beforeEach(function () {
            forms.init(bs, events);
        });
        it("should add browser Event", function() {
            var args = eventStub.getCall(0).args;
            assert.equal(args[1], "keyup");
            assert.equal(args[2], "browserEvent");
        });
        it("should add socket Event", function() {
            var args = socketStub.getCall(0).args;
            assert.equal(args[0], "input:text");
            assert.equal(args[1], "socketEvent");
        });
        it("should call browserEvent with BS object", function () {
            sinon.assert.calledWithExactly(browserEventStub, bs);
        });
        it("should call browserEvent with BS object", function () {
            sinon.assert.calledWithExactly(socketEventStub, bs, events);
        });
    });

    describe("browserEvent", function(){
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
                    value: "text"
                }
            };
        });
        after(function () {
            dataStub.restore();
        });
        it("should return a function", function(){
            var func = forms.browserEvent();
            assert.equal(typeof func === "function", true);
        });
        it("should emit the event if element is text input or textarea", function () {
            var func = forms.browserEvent(bs);
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "input:text", {
                tagName: "INPUT",
                index: 0,
                value: "text"
            });
        });
        it("should emit the event if element is text input or textarea: (1)", function () {
            var func = forms.browserEvent(bs);

            eventMock.target.value = "alt text";
            func(eventMock);

            sinon.assert.calledWithExactly(socketStubEmit, "input:text", {
                tagName: "INPUT",
                index: 0,
                value: "alt text"
            });
        });
        it("should not emit the event if disabled & reset the flag", function () {
            forms.canEmitEvents = false;
            var func = forms.browserEvent(bs);
            func(eventMock);
            sinon.assert.notCalled(socketStubEmit);
            assert.equal(forms.canEmitEvents, true);
        });
    });
    describe("socketEvent(): ", function(){
        var func;
        before(function () {
            func = forms.socketEvent(bs);
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
        it("should set the value of the element", function () {
            var elementStub = sinon.stub(bs.utils, "getSingleElement").returns({});
            var actual = func({value: "kittie"});
            assert.equal(actual.value, "kittie");
            elementStub.restore();
        });
    });
});