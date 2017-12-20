describe("The click Plugin", function () {

    var clicks = window.__bs_clicks__;
    var bs     = __bs_stub__;
    var eventStub, browserEventStub, socketEventStub, socketStub;

    before(function () {
        eventStub        = sinon.stub(__bs_events__, "addEvent");
        browserEventStub = sinon.stub(clicks, "browserEvent").returns("EVENT");
        socketEventStub  = sinon.stub(clicks, "socketEvent").returns("socketEvent");
        socketStub       = sinon.stub(bs.socket, "on").returns("socket");
        socketStubEmit   = sinon.stub(bs.socket, "emit").returns("socket");
    });

    beforeEach(function () {
        clicks.canEmitEvents = true;
    });

    after(function () {
        eventStub.restore();
        browserEventStub.restore();
        socketEventStub.restore();
        socketStub.restore();
        socketStubEmit.restore();
    });

    it("should init correctly", function() {

        clicks.init(bs, __bs_events__);

        var args = eventStub.getCall(0).args;
        assert.equal(args[1], "click");
        assert.equal(args[2], "EVENT");

        sinon.assert.calledWithExactly(socketStub, "click", "socketEvent");

        sinon.assert.calledWithExactly(browserEventStub, bs);
        sinon.assert.calledWithExactly(socketEventStub, bs, __bs_events__);

    });

    describe("browserEvent(): ", function(){
        var getDataStub, eventMock, func, dataStub, changeSpy;
        before(function () {
            browserEventStub.restore();
            dataStub = {
                tagName: "DIV",
                index: 0
            };
            getDataStub = sinon.stub(bs.utils, "getElementData").returns(dataStub);
            changeSpy   = sinon.stub(bs.utils, "forceChange");
        });
        beforeEach(function(){
            eventMock = {
                target: {},
                type: "DIV"
            };
            socketStubEmit.reset();
            func = clicks.browserEvent(bs);
        });
        afterEach(function () {
            changeSpy.reset();
        });
        after(function () {
            getDataStub.restore();
        });
        it("should add click events to body", function(){
            func(eventMock);
        });
        it("should return early if element type is checkbox or radio", function(){
            eventMock.target.type = "radio";
            func(eventMock);
            sinon.assert.notCalled(socketStubEmit);
        });
        it("should emit the event", function(){
            func(eventMock);
            sinon.assert.calledWithExactly(socketStubEmit, "click", dataStub);
        });
        it("should emit only if the flag is true", function(){
            clicks.canEmitEvents = false;
            func(eventMock);
            sinon.assert.notCalled(socketStubEmit);
        });
        it("should reset the flag if was initially false", function(){
            clicks.canEmitEvents = false;
            func(eventMock);
            assert.equal(clicks.canEmitEvents, true);
        });
        it("should force the change event if elem type is radio or checkbox", function () {
            eventMock.target.type = "checkbox";
            func(eventMock);
            sinon.assert.called(changeSpy);
        });
        it("should force the change event if elem type is radio or checkbox", function () {
            eventMock.target.type = "radio";
            func(eventMock);
            sinon.assert.called(changeSpy);
        });
    });

    describe("socketEvent(): ", function(){

        var func, canSyncStub, triggerClick, elemStub;
        before(function(){
            socketEventStub.restore();
            func            = clicks.socketEvent(bs, __bs_events__);
            canSyncStub     = sinon.stub(bs, "canSync").returns(true);
            triggerClick    = sinon.stub(__bs_events__, "triggerClick");
            elemStub        = sinon.stub(bs.utils, "getSingleElement").returns(true);
        });
        afterEach(function () {
            canSyncStub.reset();
            elemStub.reset();
            triggerClick.reset();
        });
        after(function () {
            canSyncStub.restore();
            triggerClick.restore();
            elemStub.restore();
        });
        it("should return early if cannot sync", function(){
            canSyncStub.returns(false);
            func({});
            sinon.assert.notCalled(triggerClick);
        });
        it("should call triggerClick() if canSync is true", function(){
            canSyncStub.returns(true);
            func({});
            sinon.assert.called(triggerClick);
        });
        it("should not attempt to trigger a click if element does not exist", function(){
            canSyncStub.returns(true);
            elemStub.returns(false);
            func({});
            sinon.assert.notCalled(triggerClick);
        });
    });
});