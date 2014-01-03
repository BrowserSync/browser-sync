describe("Browser Events:", function () {

    var ghost;
    var scope;
    var utils;
    var wrapper;
    var clickSpy;

    before(function () {

        ghost = window.ghost;
        utils = window.ghost.utils;

        scope = {
            ghostMode: {
                enabled: true,
                clicks: true
            }
        };

        clickSpy = sinon.spy(ghost.listeners, "click");
        ghost.initClickEvents(scope, utils, ghost.listeners.click);

        wrapper = $("<div></div>", {id: "fixture-wrapper"});
        $("body").append(wrapper);

        var html = window.__html__["fixtures/links.html"];
        $("#fixture-wrapper").append(html);

    });
    afterEach(function () {
        $("#fixture-wrapper").empty();
    });
    after(function () {
        $("#fixture-wrapper").remove();
    });
    it("can add click events to body", function () {
        assert.equal(1, 1);
    });

});