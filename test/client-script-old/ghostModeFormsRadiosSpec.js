describe("Ghostmode: forms", function () {

    var ghost, scope, input1, input2, radio1, radio2, radio3, checkbox, utils;

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

        radio1 = document.createElement("input");
        radio1.type = "radio";
        radio1.id = "radio1";

        radio2 = document.createElement("input");
        radio2.type = "radio";
        radio2.id = "radio2";

        radio3 = document.createElement("input");
        radio3.type = "radio";
        radio3.id = "radio3";
    });

    it("can retrieve all Radio buttons", function () {
        document.getElementsByTagName('body')[0].appendChild(radio1);
        document.getElementsByTagName('body')[0].appendChild(radio2);
        var inputs = ghost.getInputs();
        expect(inputs.radios.length).toBe(2);
    });

    it("can emit an event when an option is selected", function () {

        spyOn(ghost, "emitEvent");

        document.getElementsByTagName('body')[0].appendChild(radio3);
        ghost.listeners.radioChange({target: radio3});

        expect(ghost.emitEvent).toHaveBeenCalledWith('input:radio', { id : 'radio3', value : 'on' });
    });
});