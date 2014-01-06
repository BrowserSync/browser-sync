describe("Ghostmode: forms", function () {

    var ghost, scope, input1, input2, utils, wrapper, spy;

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

    it("can retrieve all radio buttons inputs", function () {
        var inputs = ghost.getInputs();
        assert.equal(inputs.radios.length, 3);
    });

    it("can emit an event when an option is selected", function () {
        var elem = $("input[type=radio]")[0], actual;
        ghost.listeners.radioChange({target: elem});
        actual = spy.calledWith("input:radio", { id : "confirm-0", value : "1" });

        assert.equal(actual, true);
    });
});