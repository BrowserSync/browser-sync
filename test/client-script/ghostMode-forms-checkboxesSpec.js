describe("Ghostmode Forms: Checkboxes", function () {

    var ghost, scope, wrapper, checkbox, utils, spy;

    before(function () {
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

    it("can retrieve all checkbox buttons", function () {
        var inputs = ghost.getInputs();
        assert.equal(inputs.checkboxes.length, 2);
    });

    it("can emit an event when an option is selected", function () {

        var elem = $("input[type=checkbox]")[0];

        elem.checked = true;

        ghost.listeners.checkboxChange({target: elem});

        var actual = spy.calledWith("input:checkbox", { id : "option-1", checked: true });

        assert.equal(actual, true);
    });
    it("can emit an event when an option is de-selected", function () {

        var elem = $("input[type=checkbox]")[0];

        elem.checked = false;

        ghost.listeners.checkboxChange({target: elem});

        var actual = spy.calledWith("input:checkbox", { id : "option-1", checked: false });

        assert.equal(actual, true);
    });
});