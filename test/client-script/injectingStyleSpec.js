/**
 * Created by shakyshane on 18/09/2013.
 */

describe("Injecting Styles:", function () {

    var si;
    var scope;
    var methods;
    var siActions;
    var actions;

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

    var timeStamp = function (time) {
        return "?rel=" + time;
    };

    // For testing if a string has has the timestamp appended;
    var regex = /(style\.css\?rel=\d+)$/;

    beforeEach(function(){
        methods = window.browserSync;
        actions = window.browserSyncActions;
        scope = {};
    });

    describe("Reloading CSS files:", function () {

        beforeEach(function(){
            spyOn(actions, "reloadBrowser");
            spyOn(actions, "swapFile");
        });

        it("can reload the browser if a url is provided", function () {

            methods.reloadEvent(scope, { url: "truthyString" }, actions);
            expect(actions.reloadBrowser).toHaveBeenCalled();
        });

        it("Can call the swap file method if an assetURL is provided", function () {

            methods.reloadEvent(scope, { assetFileName: "style.css", fileExtension: "css" }, actions);
            expect(actions.swapFile).not.toHaveBeenCalled();
        });
    });

    describe("Getting Tag names", function () {

        it("can get a CSS tagname", function () {

            expect(methods.getTagName("css")).toBe("link");
        });
        it("can get a IMG tagname", function () {

            expect(methods.getTagName("jpg")).toBe("img");
        });
    });

    describe("getting dom elements from a file extension", function () {

        beforeEach(function(){
            spyOn(actions, "reloadBrowser");
            spyOn(actions, "swapFile");
        });

        it("can retrieve dom elements", function () {

            var domElem = document.createElement("link");
            domElem.href = "style.css";
            var domElem2 = document.createElement("link");
            domElem2.href = "core.css";

            document.getElementsByTagName('head')[0].appendChild(domElem);
            document.getElementsByTagName('head')[0].appendChild(domElem2);


            var domData = browserSync.getElems("css");

            expect(domData.elems.length).toBe(2);
            expect(domData.attr).toBe("href");
        });

        it("can call swapfile if a match is found", function () {
            methods.reloadEvent(scope, { assetFileName: "style.css", fileExtension: "css" }, actions);
            expect(actions.swapFile).toHaveBeenCalled();
        });
        it("does NOT call swapfile if a match is not found", function () {
            methods.reloadEvent(scope, { assetFileName: "style2-not-real.css", fileExtension: "css" }, actions);
            expect(actions.swapFile).not.toHaveBeenCalled();
        });
    });

    describe("getting matching dom elements from an array", function () {
        var elem, elem2, elem3, elems, match;

        beforeEach(function() {

            elem = document.createElement("link");
            elem.href = "style.css";
            elem2 = document.createElement("link");
            elem2.href = "core.css";
            elem3 = document.createElement("link");
            elem3.href = "style-with-rel.css?rel=213456";

            elems = document.getElementsByTagName("link");
            match = null;
        });

        it("can return matched elements", function () {
            match = methods.getMatches([elem, elem2], "style.css", "href");
            expect(match.href).toBe(wrapUrl("style.css"));
        });

        it("can return matched elems with existing query strings", function () {
            match = methods.getMatches([elem, elem2, elem3], "style-with-rel.css", "href");
            expect(match.href).toBe(wrapUrl("style-with-rel.css?rel=213456"));
        });
    });

    describe("Swapping a file", function () {

        var elem, elem2, elem3, elem4, expected;

        beforeEach(function(){
            elem = document.createElement("link");
            elem.href = "core/style.css";
            elem2 = document.createElement("link");
            elem2.href = "core/style.css?rel=23456";
            elem3 = document.createElement("link");
            elem3.href = "style.css?rel=";
            elem4 = document.createElement("link");
            elem4.href = "core/style.css??";
        });

            describe("when using a regex in tests", function () {
                it("can run a true test", function () {
                    expect(regex.test("style.css?rel=2335")).toBe(true);
                });
                it("can run a false test", function () {
                    expect(regex.test("style.css")).toBe(false);
                    expect(regex.test("style.css?")).toBe(false);
                });
            });

        it("can append a rel timestamp to a link that doesn't have one", function () {

            var transformedElem = actions.swapFile(elem, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });

        it("can append a rel timestamp to a link that already has one", function () {

            var transformedElem = actions.swapFile(elem2, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });

        it("can append a rel timestamp to a mal-formed assetUrl", function () {

            var transformedElem = actions.swapFile(elem3, "href");
            expected = wrapUrl("style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });

        it("can append a rel timestamp to a mal-formed assetUrl (2)", function () {

            var transformedElem = actions.swapFile(elem4, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });
    });

    describe("swapping a file: e2e:", function () {

        var elem, elem2, transformedElem, expected;
        beforeEach(function(){

            elem = document.createElement("link");
            elem.href = "core/style.css";
            document.getElementsByTagName('head')[0].appendChild(elem);

            elem2 = document.createElement("link");
            elem2.href = "core/style.css?rel=123456";
            document.getElementsByTagName('head')[0].appendChild(elem2);

        });

        it("can swap the url of an asset for one with a timestamp", function () {

            transformedElem = methods.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });


        it("can swap the url of an asset that already has a timestamp", function () {

            transformedElem = methods.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            expect(transformedElem.elem.href).toBe(expected);
        });
    });
});