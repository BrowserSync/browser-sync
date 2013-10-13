describe("Browser Events:", function () {

    var ghost;
    var scope;
    var utils;

    function fireEvent(obj,evt){

        var fireOnThis = obj;
        if( document.createEvent ) {
            var evObj = document.createEvent('MouseEvents');
            evObj.initEvent( evt, true, false );
            fireOnThis.dispatchEvent( evObj );

        } else if( document.createEventObject ) {
            var evObj = document.createEventObject();
            fireOnThis.fireEvent( 'on' + evt, evObj );
        }
    }

    var appendsHost = true;
    (function(){
        var elem = document.createElement("link");
        elem.href= "/style.css";
        if (!/^http:\/\//.test(elem.href)) {
            appendsHost = false;
        }
    })();

    var wrapUrl = function (url) {
        if (!appendsHost) {
            return url;
        }
        return "http://" + window.location.host + "/" + url;
    };

    beforeEach(function(){
        document.body.style.cssText = "height:2000px;";
        scope = {
            ghostMode: {
                enabled: true,
                events: [
                    "scroll"
                ]
            }
        };
        ghost = window.ghost;
        utils = window.ghost.utils;
        window.scrollTo(0, 0); //reset scroll position after each test.
        spyOn(ghost.listeners, "scroll");
    });

    afterEach(function () {
        window[ghost.utils.removeEventListener](ghost.utils.prefix + "scroll", ghost.listeners.scroll);
    });

    it("can add scroll Listeners", function () {

        ghost.initEvents(scope, ['scroll'], utils, ghost.listeners);

        window.scrollTo(0, 100);

        waits(100);

        runs(function () {
            expect(ghost.listeners.scroll).toHaveBeenCalled();
        });
    });


    describe("adding Click events", function () {

        var button, img;

        beforeEach(function(){
            spyOn(ghost.listeners, "click");
            button = document.createElement("A");
            button.href = "#";
            document.getElementsByTagName('body')[0].appendChild(button);

            var button2;
            button2 = document.createElement("A");
            button2.href = "next";

            img = document.createElement("img");
            button2.appendChild(img);

            document.getElementsByTagName('body')[0].appendChild(button2);

            ghost.initClickEvents(scope, utils, ghost.listeners.click);

        });

        it("can add click events to links", function () {

            fireEvent(button, "click");
            expect(ghost.listeners.click).toHaveBeenCalled();

        });
        it("can fire a click event on IMG wrapped in A", function () {

            ghost.initClickEvents(scope, utils, function (event) {
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
            });
            fireEvent(button, "click");
            expect(ghost.listeners.click).toHaveBeenCalled();

        });
        it("can retreive the HREF value from an anchor click", function () {
            var href = ghost.getHref(button);
            var expected = appendsHost ? "http://" + window.location.host + "/context.html" + "#" : "#";
            expect(href).toBe(expected);
        });
        it("can retreive the HREF value from an IMG wrapped in an anchor click", function () {
            var href = ghost.getHref(img);
            expect(href).toBe(wrapUrl("next"));
        });
    });
});