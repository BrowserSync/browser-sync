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

    it("can retrieve all Text form inputs", function () {
        var inputs = ghost.getInputs();
        assert.equal(inputs.texts.length, 2);
    });

    describe("events on text inputs", function () {

        it("can emit input data to server if all data available", function () {
            var elem = $("input[type=text]")[0], actual;
            ghost.listeners.keyup({target: elem});
            actual = spy.calledWith("input:text",  { id: "name", value: "name here" });

            assert.equal(actual, true);
        });

        it("does not emit the event if an input has no ID", function () {
            var newInput = document.createElement("input");
            newInput.type = "text";
            newInput.value = "shane";
            ghost.listeners.keyup({target: newInput});

            assert.equal(spy.called, false);
        });

        describe("text areas:", function () {

            it("can emit data from a textarea", function () {
                var elem = $("#message")[0], actual;
                ghost.listeners.keyup({target: elem});
                actual = spy.calledWith("input:text",  { id: "message", value: "shane" });

                assert.equal(actual, true);
            });
            it("can store & retrieve cached DOM elements", function () {

                var cache = {};
                var elem = ghost.checkCache(cache, "message");
                assert.equal(elem.id, "message");
            });
            it("can store & retrieve cached DOM elements", function () {
                var cache = {};
                var elem = ghost.checkCache(cache, "email");
                assert.equal(elem.id, "email");
            });
            it("does not access DOM again if item is in the cache", function () {

                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "email");

                assert.equal(scope.ghostMode.cache.called, 1);

            });
            it("does access DOM again if new item NOT in the cache", function () {

                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "message");
                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "email");

                assert.equal(scope.ghostMode.cache.called, 2);
            });
            it("does access DOM again if new item NOT in the cache", function () {

                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "message");
                ghost.checkCache(scope.ghostMode.cache, "name");
                ghost.checkCache(scope.ghostMode.cache, "email");
                ghost.checkCache(scope.ghostMode.cache, "email");

                assert.equal(scope.ghostMode.cache.called, 3);
            });
        });
    });
});