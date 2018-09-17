describe("Generic Browser utils", function(){
    var browserUtils;
    before(function () {
        browserUtils = window.__bs_utils__;
    });
    describe("getBrowserScrollPosition(): ", function () {
        var act, windowStub, documentStub, stub;
        before(function () {
            act = function () {
                return browserUtils.getBrowserScrollPosition();
            };
            windowStub   = sinon.stub(browserUtils, "getWindow").returns({});
            documentStub = sinon.stub(browserUtils, "getDocument");
        });
        beforeEach(function () {
            stub = {
                documentElement: {},
                body: {}
            };
        });
        after(function () {
            windowStub.restore();
            documentStub.restore();
        });
        afterEach(function () {
            windowStub.reset();
            documentStub.reset();
        });
        it("should get scroll position from document.documentElement.scrollLeft/top", function(){
            stub.documentElement.scrollLeft = 0;
            stub.documentElement.scrollTop = 100;
            documentStub.returns(stub);
            var actual = act();
            assert.equal(actual.x, 0);
            assert.equal(actual.y, 100);
        });
        it("should get scroll position from document.body.scrollLeft/top", function(){
            stub.body.scrollLeft = 100;
            stub.body.scrollTop  = 0;
            documentStub.returns(stub);
            var actual = act();
            assert.equal(actual.x, 100);
            assert.equal(actual.y, 0);
        });
        it("should get scroll position from document.body.scrollLeft/top", function(){
            stub.body.scrollLeft = 100;
            stub.body.scrollTop  = 0;
            documentStub.returns(stub);
            var actual = act();
            assert.equal(actual.x, 100);
            assert.equal(actual.y, 0);
        });
        it("should get scroll position from window by default", function () {
            windowStub.restore();
            documentStub.returns(stub);
            var actual = act();
            assert.equal(actual.x, 0);
            assert.equal(actual.y, 0);
        });

    });
    describe("getScrollSpace(): 1", function () {
        var act;
        var documentStub;
        before(function () {
            act = function () {
                return browserUtils.getScrollSpace();
            };
            documentStub = sinon.stub(browserUtils, "getDocument").returns({
                documentElement: {
                    clientWidth: 800,
                    clientHeight: 600
                },
                body: {
                    scrollHeight: 1000
                }
            });
        });
        after(function () {
            documentStub.restore();
        });
        it("should return x & y values", function(){
            var actual = act();
            assert.equal(actual.x, 200);
            assert.equal(actual.y, 400);
        });
    });
    describe("getting a single element", function(){
        var fakeElems = [
            {
                id: "item1",
                tagName: "link"
            },
            {
                id: "item2",
                tagName: "link"
            }
        ], stub;
        before(function(){
            stub = sinon.stub(document, "getElementsByTagName").returns(fakeElems);
        });
        after(function () {
            stub.restore();
        });
        it("should call getElementsByTagName() with the tagname", function(){
            browserUtils.getSingleElement("link", 0);
            sinon.assert.calledWithExactly(stub, "link");
        });
        it("should return the correct index: 1", function(){
            var actual   = browserUtils.getSingleElement("link", 0);
            var expected = "item1";
            assert.equal(actual.id, expected);
        });
        it("should return the correct index: 2", function(){
            var actual   = browserUtils.getSingleElement("link", 1);
            var expected = "item2";
            assert.equal(actual.id, expected);
            stub.restore();
        });
    });
    describe("Getting index of an element", function () {
        it("should return the correct index", function () {
            var elem     = {id: "abx"};
            var stub     = sinon.stub(document, "getElementsByTagName").returns([elem, {id: "xab"}]);
            var actual   = browserUtils.getElementIndex("link", elem);
            var expected = 0;
            assert.equal(actual, expected);
            stub.restore();
        });
        it("should return the correct index", function () {
            var elem     = {id: "xab"};
            var stub     = sinon.stub(document, "getElementsByTagName").returns([{id: "abx"}, elem]);
            var actual   = browserUtils.getElementIndex("link", elem);
            var expected = 1;
            assert.equal(actual, expected);
            stub.restore();
        });
    });

    describe("Getting element data for socket event", function(){
        var indexStub;
        before(function () {
            indexStub = sinon.stub(browserUtils, "getElementIndex").returns(0);
        });
        after(function () {
            indexStub.restore();
        });
        it("should return an object containing element info", function(){
            var elem = {
                tagName: "link"
            };
            var actual   = browserUtils.getElementData(elem);
            assert.equal(actual.tagName, "link");
            assert.equal(actual.index, 0);
        });
    });

    describe("forceChange(): ", function () {
        var blur  = sinon.spy();
        var focus = sinon.spy();
        var elem = {
            blur: blur,
            focus: focus
        };

        var actual = window.__bs_utils__.forceChange(elem);
        sinon.assert.calledOnce(blur);
        sinon.assert.calledOnce(focus);
    });
    describe("getDocument(): ", function () {
        window.__bs_utils__.getDocument();
    });
    describe("getDocument(): ", function () {
        window.__bs_utils__.getBody();
    });
});