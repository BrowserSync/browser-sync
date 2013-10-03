describe("Ghostmode Forms: Submitting", function () {

    var ghost, scope, opt1, opt2, formElem, checkbox, utils;

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

        formElem = document.createElement("form");
        formElem.id = "form01";

        spyOn(ghost, "emitEvent");
    });


    it("can emit events wen options are selected", function () {

        document.getElementsByTagName('body')[0].appendChild(formElem);

        formElem.value = 1;
        ghost.listeners.formSubmit({target: formElem});

        expect(ghost.emitEvent).toHaveBeenCalledWith('form:submit', { id: "form01"});

    });
});