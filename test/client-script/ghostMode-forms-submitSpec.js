describe("Ghostmode Forms: Submitting", function () {

    var browserSync, ghost, scope, utils, wrapper, spy;

    before(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;
        browserSync = window.BrowserSync;

        wrapper = $("<div></div>", {id: "fixture-wrapper"});
        $("body").append(wrapper);

        spy = sinon.spy(ghost, "emitEvent");
    });

    afterEach(function () {
        $("#fixture-wrapper").empty();
        spy.reset();
    });

    after(function () {
        $("#fixture-wrapper").remove();
        spy.restore();
    });

    beforeEach(function(){
        var html = window.__html__["fixtures/inputs.html"];
        $("#fixture-wrapper").append(html);
    });

    // _todo - figure out how to test submit
    it("can emit the reset event", function () {

        browserSync.initGhostMode({forms:true}, utils, ghost.listeners);

        $("form")[0].reset();

        var actual = spy.calledWith("form:reset", { id: "form01"});

        assert.equal(actual, true);
    });
});