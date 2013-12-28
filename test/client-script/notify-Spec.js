describe("Notify Element", function () {

    var scope;
    var browserSync;
    var actions;
    var elem;
    var ghost;
    var styles;

    before(function () {

        browserSync = window.BrowserSync;
        styles = window.styles;
        ghost = window.ghost;
        actions = window.browserSyncActions;

        actions.reloadBrowser = function () {
            return true;
        };
        scope = {};
    });
    afterEach(function () {

    });

    describe("creating the element", function () {
        beforeEach(function () {
            elem = browserSync.createNotifyElem();
        });

        it("should be able to create the element", function () {
            assert.notEqual(typeof elem, "undefined");
        });
        it("should have an ID set", function () {
            assert.equal(elem.id, "notifyElem");
        });
        it("should be a div", function () {
            var actual = elem.tagName;
            assert.equal(actual, "DIV");
        });
    });
    describe("inserting to DOM", function () {
        beforeEach(function () {
            elem = browserSync.createNotifyElem();
        });

        it("should be able to create the element", function () {
            var domElem = document.getElementById("notifyElem");
            assert.equal(domElem !== null, true);
        });
    });
    describe("styling the element", function () {

        beforeEach(function () {
            var styles = [
                "background-color: black",
                "color: white"
            ];
            elem = browserSync.createNotifyElem(styles);
        });
        it("should apply provided styling", function () {
            var actual = /background-color: black/i.test(elem.style.cssText);
            assert.equal(actual, true);
        });
        it("should apply provided styling", function () {
            var actual = /color: white/i.test(elem.style.cssText);
            assert.equal(actual, true);
        });
    });
    describe("updating with new message", function () {
        var elem;
        beforeEach(function () {
            elem = browserSync.createNotifyElem();
        });
        it("should update inner HTML", function () {
            var msg = "Injected", actual;
            browserSync.notify(msg, elem);
            actual = elem.innerHTML === msg;

            assert.equal(actual, true);
        });
        it("should update inner HTML (2)", function () {
            var msg = "Injected: core.css", actual;
            browserSync.notify(msg, elem);
            actual = elem.innerHTML === msg;

            assert.equal(actual, true);
        });
    });
    describe("updating with temp styles", function () {
        var elem;
        beforeEach(function () {
            elem = browserSync.createNotifyElem();
        });
        it("should set the top property to current scrollTop", function () {

            var msg = "Injected", actual;
            browserSync.notify(msg, elem);
            actual = elem.style.display;

            assert.equal(actual, "block");
        });
        it("should set the display property to BLOCK", function () {

            var msg = "Injected", actual;
            browserSync.notify(msg, elem);
            actual = elem.style.display;

            assert.equal(actual, "block");
        });
        it("should set the display property to back to NONE after timeout", function (done) {

            var msg = "Injected", actual;
            browserSync.notify(msg, elem, 10);

            window.setTimeout(function () {
                actual = elem.style.display;
                assert.equal(actual, "none");
                done();
            }, 20);
        });
        it("should set the display property to back to NONE after timeout", function () {

            var scrollTop = ghost.getScrollTop(), actual, expected;
            browserSync.notify("notify", elem, 10);
            actual = elem.style.top;
            expected = scrollTop + "px";

            assert.equal(actual, expected);
        });
    });
});