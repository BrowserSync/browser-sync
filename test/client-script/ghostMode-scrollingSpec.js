describe("Ghost Mode: Scrolling", function () {

    var ghost;
    var scope;
    var spy;
    var browserSync;

    before(function () {
        scope = {
            ghostMode: {
                enabled: true
            }
        };
        ghost = window.ghost;
        browserSync = window.BrowserSync;

        spy = sinon.spy(ghost, "emitEvent");
    });
    before(function(){

        document.body.style.cssText = "height:2000px;";
        window.scrollTo(0, 0); //reset scroll position after each test.
    });

    afterEach(function () {
        spy.reset();
        window[ghost.utils.removeEventListener](ghost.utils.prefix + "scroll", ghost.listeners.scroll);
    });

    after(function () {
        spy.restore();
    });

    describe("Util Methods:", function () {
        it("getScrollPosition: should return an array with two values", function(){
            var scrollPosition = ghost.getScrollPosition();
            assert.equal(scrollPosition.length, 2);
        });
        it("getScrollSpace: should return an array with two values", function(){
            var scrollPosition = ghost.getScrollSpace();
            assert.equal(scrollPosition.length, 2);
        });
        it("getScrollTop: should return an just the Y value of the scroll position", function(){
            var scrollPosition = ghost.getScrollTop();
            assert.equal(typeof scrollPosition === "number", true);
        });
        it("getScrollTopPercentage: should return an array with two values", function(){
            var scrollTopPercentage = ghost.getScrollTopPercentage();
            assert.equal(typeof scrollTopPercentage === "number", true);
        });
        it("getScrollPercentage: should return an array with two values", function(){
            var actual = ghost.getScrollPercentage([1000, 1000], [250, 500]);
            assert.equal(actual[0], 0.25);
            assert.equal(actual[1], 0.5);
        });
    });


    it("can Set the scroll position of a window", function () {

        ghost.setScrollTop(scope.ghostMode, 100);
        assert.equal(ghost.getScrollTop(), 100);
    });

    it("can disable ghost mode when setting it's own scroll top. (ie, when it's received an event from server)", function () {
        ghost.setScrollTop(scope.ghostMode, 100);
        assert.equal(scope.ghostMode.enabled, false);
    });

//    it("can emit an event to the server when the window is scrolled (1)", function (done) {
//
//        var space = ghost.getScrollSpace()[1];
//
//        window.setTimeout(function () {
//
//            window.scrollTo(0, space/2); // 50%
//            ghost.listeners.scroll();
//
//        }, 100);
//
//        window.setTimeout(function () {
//
//            var actual = spy.calledWith("scroll", {
//                pos: 0.5,
//                url: window.location.host + window.location.pathname
//            });
//
//            assert.equal(actual, true);
//            done();
//        }, 200);
//    });

//    it("should emit multiple scroll events when they happen outside of the threshold", function (done) {
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 200);
//            ghost.listeners.scroll();
//        }, 50);
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 300);
//            ghost.listeners.scroll();
//        }, 200);
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 300);
//            ghost.listeners.scroll();
//        }, 300);
//
//        window.setTimeout(function () {
//            assert.equal(spy.callCount, 3);
//            done();
//        }, 1000);
//    });

//    it("should not emit the event if scroll events happen faster than threshold", function (done) {
//
//        browserSync.setOptions({
//            scrollThrottle: 50
//        });
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 200);
//            ghost.listeners.scroll();
//        }, 50);
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 300);
//            ghost.listeners.scroll();
//        }, 55); // second scroll too fast
//
//        window.setTimeout(function () {
//            assert.equal(spy.callCount, 1);
//            done();
//        }, 200);
//    });
//
//    it("SHOULD emit another event after a previous one was denied", function (done) {
//
//        browserSync.setOptions({
//            scrollThrottle: 50
//        });
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 200);
//            ghost.listeners.scroll();
//        }, 50);
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 300);
//            ghost.listeners.scroll();
//        }, 55); // second scroll too fast
//
//        window.setTimeout(function () {
//            window.scrollTo(0, 250);
//            ghost.listeners.scroll();
//        }, 200); // Third scroll not too fast!
//
//        window.setTimeout(function () {
//            assert.equal(spy.callCount, 2);
//            done();
//        }, 300);
//    });
});