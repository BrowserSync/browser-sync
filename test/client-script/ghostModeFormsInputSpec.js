describe("Ghostmode: forms", function () {

    var ghost, scope, input1, input2, radio, checkbox, utils;

    beforeEach(function(){
        scope = {
            ghostMode: {
                enabled: true,
                cache: {}
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;

        input1 = document.createElement("input");
        input1.type = "text";
        input1.id = "input1";

        input2 = document.createElement("input");
        input2.type = "text";
        input2.id = "input2";

    });

    it("can retrieve all Text form inputs", function () {
        document.getElementsByTagName('body')[0].appendChild(input1);
        document.getElementsByTagName('body')[0].appendChild(input2);
        var inputs = ghost.getInputs();
        expect(inputs.texts.length).toBe(2);
    });

    describe("events on text inputs", function () {

        beforeEach(function(){
            spyOn(ghost,"emitEvent");
        });
        it("can emit input data to server if all data available", function () {

            input1.value = "shane";
            input1.id = "inputId1";

            ghost.listeners.keyup({target: input1});

            expect(ghost.emitEvent).toHaveBeenCalledWith("input:type",  { id: "inputId1", value: "shane" })
        });

        it("does not emit the event if an input has no ID", function () {
            var newInput = document.createElement("input");
            newInput.type = "text";
            newInput.value = "shane";

            ghost.listeners.keyup({target: newInput});

            expect(ghost.emitEvent).not.toHaveBeenCalled();
        });

        describe("text areas:", function () {

            var newInput, newInput2;
            beforeEach(function(){
                newInput = document.createElement("textarea");
                newInput.value = "shane";
                newInput.id = "textarea01";

                newInput2 = document.createElement("input");
                newInput2.value = "kittie";
                newInput2.id = "textinput01";
                scope.ghostMode.cache.called = 0;
            });

            it("can emit data from a textarea", function () {
                ghost.listeners.keyup({target: newInput});
                expect(ghost.emitEvent).toHaveBeenCalledWith("input:type",  { id: "textarea01", value: "shane" });
            });
            it("can store & retrieve cached DOM elements", function () {
                document.getElementsByTagName('body')[0].appendChild(newInput);
                var cache = {};
                var elem = ghost.checkCache(cache, "textarea01");
                expect(elem.id).toBe("textarea01");
            });
            it("can store & retrieve cached DOM elements", function () {
                document.getElementsByTagName('body')[0].appendChild(newInput);
                var cache = {};
                var elem = ghost.checkCache(cache, "textarea01");
                expect(elem.id).toBe("textarea01");
            });
            it("does not access DOM again if item is in the cache", function () {

                document.getElementsByTagName('body')[0].appendChild(newInput2);

                var elem = ghost.checkCache(scope.ghostMode.cache, "textinput01");
                var elem2 = ghost.checkCache(scope.ghostMode.cache, "textinput01");

                expect(scope.ghostMode.cache.called).toBe(1);
            });
        });
    });
});