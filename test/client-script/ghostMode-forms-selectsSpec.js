describe("Ghostmode Forms: Selects", function () {

    var ghost, scope, utils, wrapper, spy;

    before(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

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

    it("can emit events when options are selected (1)", function () {

        var elem = $("select")[0], actual;
        ghost.listeners.selectChange({target: elem});
        actual = spy.calledWith("input:text", { id: "country", value: "uk" });
        assert.equal(actual, true);
    });
    it("can emit events when options are selected (2)", function () {

        var elem = $("select")[0], actual;
        elem.value = "spain";
        ghost.listeners.selectChange({target: elem});
        actual = spy.calledWith("input:text", { id: "country", value: "spain" });
        assert.equal(actual, true);
    });
});