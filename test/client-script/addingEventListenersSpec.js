describe("Browser Events:", function () {

    var ghost;
    var scope;
    var utils;
    var spy;
    var wrapper;

    before(function () {
        ghost = window.ghost;
        utils = window.ghost.utils;
        spy = sinon.spy(ghost.listeners, "scroll");
        wrapper = $("<div></div>", {id: "fixture-wrapper"});
        $("body").append(wrapper);
    });

    beforeEach(function(){

        document.body.style.cssText = "height:2000px;";

        scope = {
            ghostMode: {
                enabled: true,
                events: [
                    "scroll"
                ]
            }
        };

        window.scrollTo(0, 0); //reset scroll position after each test.
    });

    afterEach(function () {
        $("#fixture-wrapper").empty();
        spy.reset();
        window[ghost.utils.removeEventListener](ghost.utils.prefix + "scroll", ghost.listeners.scroll);
    });

    it("can add scroll Listeners", function (done) {

        ghost.initEvents(scope, ["scroll"], utils, ghost.listeners);

        window.scrollTo(0, 100);
        window.setTimeout(function () {
            assert.equal(spy.called, true);
            done();
        }, 100);
    });


    describe("adding Click events", function () {

        var spy;

        before(function () {
            spy = sinon.spy(ghost.listeners, "click");
        });
        afterEach(function () {
            spy.reset();
        });
        beforeEach(function(){

            var html = window.__html__["fixtures/links.html"];
            $("#fixture-wrapper").append(html);
            ghost.initClickEvents(scope, utils, ghost.listeners.click);
        });

        it("can add click events to links", function () {
            fireEvent($("a#link")[0], "click");
            assert.equal(spy.called, true);
        });
        it("can add click events to links", function () {
            fireEvent($("a#img-link")[0], "click");
            assert.equal(spy.called, true);
        });
        it("can fire a click event on IMG wrapped in A", function () {

            ghost.initClickEvents(scope, utils, function (event) {
                return event.preventDefault ? event.preventDefault() : event.returnValue = false;
            });
            fireEvent($("a#img-link")[0], "click");
            assert.equal(spy.called, true);
        });
        describe("retrieving the HREF attr", function () {
            it("directly from an <a></a>", function () {
                var href = ghost.getHref($("a#img-link")[0]);
                var expected = "http://" + window.location.host + "/context.html#";
                assert.equal(href, expected);
            });
            it("from an image wrapped in an anchor", function () {
                var href = ghost.getHref($("img:first")[0]);
                var expected = "http://" + window.location.host + "/context.html#";
                assert.equal(href, expected);
            });
        });
    });
});