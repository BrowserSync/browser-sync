describe("Ghostmode Forms: Selects", function () {

    var ghost, scope, opt1, opt2, selectElem, checkbox, utils;

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

        selectElem = document.createElement("select");
        selectElem.id = "select01";

        opt1 = document.createElement("option");
        opt1.value = 1;
        opt1.innerHTML = "first option";

        opt2 = document.createElement("option");
        opt2.value = 2;
        opt2.innerHTML = "second option";

        selectElem.appendChild(opt1);
        selectElem.appendChild(opt2);

        spyOn(ghost, "emitEvent");
    });


    it("can emit events wen options are selected", function () {

        document.getElementsByTagName('body')[0].appendChild(selectElem);

        selectElem.value = 1;
        ghost.listeners.selectChange({target: selectElem});

        expect(ghost.emitEvent).toHaveBeenCalledWith('input:select', { id: "select01", value: '1' });

        selectElem.value = 2;
        ghost.listeners.selectChange({target: selectElem});

        expect(ghost.emitEvent).toHaveBeenCalledWith('input:select', { id: "select01", value: '2' });
    });
});