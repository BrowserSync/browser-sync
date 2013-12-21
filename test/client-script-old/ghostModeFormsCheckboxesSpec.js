describe("Ghostmode Forms: Checkboxes", function () {

    var ghost, scope, input1, input2, checkbox1, checkbox2, checkbox3, checkbox, utils;

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

        checkbox1 = document.createElement("input");
        checkbox1.type = "checkbox";
        checkbox1.id = "checkbox1";

        checkbox2 = document.createElement("input");
        checkbox2.type = "checkbox";
        checkbox2.id = "checkbox2";

        checkbox3 = document.createElement("input");
        checkbox3.type = "checkbox";
        checkbox3.id = "checkbox3";
    });

    it("can retrieve all checkbox buttons", function () {
        document.getElementsByTagName('body')[0].appendChild(checkbox1);
        document.getElementsByTagName('body')[0].appendChild(checkbox2);
        var inputs = ghost.getInputs();
        expect(inputs.checkboxes.length).toBe(2);
    });


    it("can emit an event when an option is selected", function () {

        spyOn(ghost, "emitEvent");

        document.getElementsByTagName('body')[0].appendChild(checkbox3);
        checkbox3.checked = true;

        ghost.listeners.checkboxChange({target: checkbox3});

        expect(ghost.emitEvent).toHaveBeenCalledWith('input:checkbox', { id : 'checkbox3', checked : true });
    });
    it("can emit an event when an option is de-selected", function () {

        spyOn(ghost, "emitEvent");

        checkbox3.checked = false;

        ghost.listeners.checkboxChange({target: checkbox3});

        expect(ghost.emitEvent).toHaveBeenCalledWith('input:checkbox', { id : 'checkbox3', checked : false });
    });
});