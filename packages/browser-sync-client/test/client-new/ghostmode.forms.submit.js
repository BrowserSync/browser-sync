describe("The Form submit Plugin", function () {

    var submit   = window.__bs_submit__;
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
        var browserEventStub, socketEventStub, eventStub;
        before(function () {
            eventStub        = sinon.stub(events, "addEvent");
            browserEventStub = sinon.stub(submit, "browserEvent").returns("browserEvent");
            socketEventStub  = sinon.stub(submit, "socketEvent").returns("socketEvent");
        });
        afterEach(function () {
            eventStub.reset();
        });
        after(function () {
            browserEventStub.restore();
            socketEventStub.restore();
            eventStub.restore();
        });
        beforeEach(function () {
            submit.init(bs, events);
        });
        it("should add submit event to the body", function () {
            var args = eventStub.getCall(0).args;
            assert.equal(args[1], "submit");
            assert.equal(args[2], "browserEvent");
        });
        it("should add reser event to the body", function () {
            var args = eventStub.getCall(1).args;
            assert.equal(args[1], "reset");
            assert.equal(args[2], "browserEvent");
        });
        it("should add socket Event", function() {
            var args = socketStub.getCall(0).args;
            assert.equal(args[0], "form:submit");
            assert.equal(args[1], "socketEvent");
        });
        it("should call browserEvent with BS object", function () {
            sinon.assert.calledWithExactly(browserEventStub, bs);
        });
        it("should call socketEvent with BS object", function () {
            sinon.assert.calledWithExactly(socketEventStub, bs, events);
        });
    });

    describe("browserEvent(): ", function(){
        var dataStub, eventMock;
        before(function(){
            dataStub = sinon.stub(bs.utils, "getElementData").returns({
                tagName: "FORM",
                index: 0
            });
        });
        beforeEach(function(){
            eventMock = {
                target: {
                    tagName: "INPUT",
                    value: 1,
                    type: "radio"
                },
                type: "submit"
            };
        });
        after(function () {
            dataStub.restore();
        });
        it("should return a function", function(){
            var func = submit.browserEvent();
            assert.equal(typeof func === "function", true);
        });
        it("should emit the submit event", function () {
            var func = submit.browserEvent(bs);
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "form:submit", {
                tagName: "FORM",
                index: 0,
                type: "submit"
            });
        });
        it("should emit the reset event", function () {
            var func = submit.browserEvent(bs);
            eventMock.type = "reset";
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "form:submit", {
                tagName: "FORM",
                index: 0,
                type: "reset"
            });
        });
        it("should not emit the event if disabled & reset the flag", function () {
            submit.canEmitEvents = false;
            var func = submit.browserEvent(bs);
            func(eventMock);
            sinon.assert.notCalled(socketStubEmit);
            assert.equal(submit.canEmitEvents, true);
        });
    });
    describe("socketEvent(): ", function(){
        var func, elementStub;
        before(function () {
            func = submit.socketEvent(bs);
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
            var actual = func({type: "submit"});
            assert.equal(actual, false);
            canSyncStub.restore();
        });
        it("should call the submit method on the form", function () {
            var spy = sinon.spy();
            var formElem = {
                submit: spy
            };
            elementStub.returns(formElem);
            func({type: "submit"});
            sinon.assert.called(spy);
        });
        it("should call the submit method on the form", function () {
            var spy = sinon.spy();
            var formElem = {
                reset: spy
            };
            elementStub.returns(formElem);
            func({type: "reset"});
            sinon.assert.called(spy);
        });
    });
});