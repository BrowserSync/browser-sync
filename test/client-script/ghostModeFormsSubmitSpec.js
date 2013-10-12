describe("Ghostmode Forms: Submitting", function () {

    var ghost, scope, opt1, opt2, formElem, checkbox, utils, styleInjector;


    // Append the form once for testing submit & reset events
    formElem = document.createElement("form");
    formElem.id = "form01";
    document.getElementsByTagName('body')[0].appendChild(formElem);

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;
        styleInjector = window.styleInjector;

        spyOn(ghost, "emitEvent");
    });


    // _todo figure out how to test form submit event.

    it("can emit the reset event", function () {

        styleInjector.initGhostMode({forms:true}, utils, ghost.listeners);

        formElem.reset();

        expect(ghost.emitEvent).toHaveBeenCalledWith('form:reset', { id: "form01"});

    });
});