describe("Ghost Mode: Scrolling", function () {

    var ghost;
    var scope;

    beforeEach(function(){

        document.body.style.cssText = "height:2000px;";

        scope = {
            ghostMode: {
                enabled: true
            }
        };

        ghost = window.ghost;

        window.scrollTo(0, 0); //reset scroll position after each test.
        spyOn(ghost, "emitEvent");

    });

    afterEach(function () {
        window[ghost.utils.removeEventListener](ghost.utils.prefix + "scroll", ghost.listeners.scroll);
    });

    it("can Set the scroll position of a window", function () {

        ghost.setScrollTop(scope.ghostMode, 100);
        expect(ghost.getScrollTop()).toBe(100);
    });


    it("can disable ghost mode when setting it's own scroll top. (ie, when it's received an event from server)", function () {
        ghost.setScrollTop(scope.ghostMode, 100);
        expect(scope.ghostMode.enabled).toBe(false);
    });

    it("can emit an event to the server when the window is scrolled", function () {

        window.scrollTo(0, 100);
        ghost.listeners.scroll();

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 100);

        waitsFor(function() {
            return ghost.emitEvent.callCount > 0;
        }, "Wait for scroll events to fire", 1000);

        runs(function() {
            expect(ghost.emitEvent).toHaveBeenCalledWith("scroll", {pos:200, url:window.location.href});
        });
    });

    it("should emit multiple scroll events when they happen outside of the threshold", function () {

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 200);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 300);

        waits(1000);

        runs(function() {
            expect(ghost.emitEvent.callCount).toBe(3);
        });
    });

    it("should not emit the event if scroll events happen too fast", function () {

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 55); // second scroll too fast

        waits(150);

        runs(function() {
            expect(ghost.emitEvent.callCount).toBe(1);
        });
    });

    it("SHOULD emit another event after a previous one was denied", function () {

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 55); // second scroll too fast

        window.setTimeout(function () {
            window.scrollTo(0, 250);
            ghost.listeners.scroll();
        }, 200); // Third scroll not too fast!

        waits(300);

        runs(function() {
            expect(ghost.emitEvent.callCount).toBe(2);
        });
    });
});