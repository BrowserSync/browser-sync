describe("Injecting Styles:", function () {

    var scope;
    var browserSync;
    var actions;
    var reloadStub;
    var swapFileSpy;

    var timeStamp = function (time) {
        return "?rel=" + time;
    };

    // For testing if a string has has the timestamp appended;
    var regex = /(style\.css\?rel=\d+)$/;

    before(function(){
        browserSync = window.BrowserSync;
        actions = window.browserSyncActions;

        actions.reloadBrowser = function () {
            return true;
        };

        scope = {
            options: {
                injectChanges: true
            }
        };

        reloadStub = sinon.stub(actions, "reloadBrowser");
        swapFileSpy = sinon.spy(actions, "swapFile");
    });
    afterEach(function () {
        reloadStub.reset();
        swapFileSpy.reset();
    });
    after(function () {
        reloadStub.restore();
    });
    describe("Reloading/injecting:", function () {
        it("should reload the browser if a url is provided", function () {
            browserSync.reloadEvent(scope, { url: "truthyString" }, actions);
            assert.equal(reloadStub.called, true);
        });
        it("should NOT reload the browser if a url is NOT provided", function () {
            browserSync.reloadEvent(scope, { url: false }, actions);
            assert.equal(reloadStub.called, false);
        });
    });

    describe("Getting Tag names", function () {

        it("can get a CSS tagname", function () {
            var actual   = browserSync.getTagName("css");
            var expected = "link";
            assert.equal(actual, expected);
        });
        it("can get a IMG tagname", function () {
            var actual   = browserSync.getTagName("jpg");
            var expected = "img";
            assert.equal(actual, expected);
        });
        it("can get a IMG tagname", function () {
            var actual   = browserSync.getTagName("jpeg");
            var expected = "img";
            assert.equal(actual, expected);
        });
        it("can get a IMG PNG tagname", function () {
            var actual   = browserSync.getTagName("png");
            var expected = "img";
            assert.equal(actual, expected);
        });
        it("can get a IMG GIF tagname", function () {
            var actual   = browserSync.getTagName("gif");
            var expected = "img";
            assert.equal(actual, expected);
        });
    });

    describe("getting dom elements from a file extension", function () {

        var $head = $("head");
        beforeEach(function () {

            var link1 = $("<link>", {id: "link1", href: "style.css"});
            var link2 = $("<link>", {id: "link2", href: "core.css"});

            $head.append(link1, link2);
        });
        afterEach(function () {
            $head.find("link").remove();
        });

        it("can retrieve CSS dom elements", function () {
            var domData = browserSync.getElems("css");
            assert.equal(domData.elems.length, 2);
        });
        it("can call swapfile if a match is found", function () {
            browserSync.reloadEvent(scope, { assetFileName: "style.css", fileExtension: "css" }, actions);
            assert.equal(swapFileSpy.called, true);
        });
        it("does NOT call swapfile if a match is not found", function () {
            browserSync.reloadEvent(scope, { assetFileName: "style2-not-real.css", fileExtension: "css" }, actions);
            assert.equal(swapFileSpy.called, false);
        });
    });

    describe("getting matching dom elements from an array", function () {

        var elem, elem2, elem3, elems, matches;

        beforeEach(function() {

            elem = document.createElement("link");
            elem.href = "style.css";
            elem2 = document.createElement("link");
            elem2.href = "core.css";
            elem3 = document.createElement("link");
            elem3.href = "style-with-rel.css?rel=213456";

            elems = document.getElementsByTagName("link");
            matches = null;
        });

        it("can return multiple matched elements with the same URL", function () {
            matches = browserSync.getMatches([elem, elem2, elem3, elem], "style.css", "href");
            assert.equal(matches.length, 2);
            assert.equal(matches[0].href, wrapUrl("style.css"));
            assert.equal(matches[1].href, wrapUrl("style.css"));
        });

        it("can return matched elements", function () {
            matches = browserSync.getMatches([elem, elem2], "style.css", "href");
            assert.equal(matches[0].href, wrapUrl("style.css"));
        });

        it("can return matched elems with existing query strings", function () {
            matches = browserSync.getMatches([elem, elem2, elem3], "style-with-rel.css", "href");
            assert.equal(matches[0].href, wrapUrl("style-with-rel.css?rel=213456"));
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
                    assert.equal(regex.test("style.css?rel=2335"), true);
                });
                it("can run a false test", function () {
                    assert.equal(regex.test("style.css"), false);
                    assert.equal(regex.test("style.css?"), false);
                });
            });

        it("can append a rel timestamp to a link that doesn't have one", function () {

            var transformedElem = actions.swapFile(elem, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });
        it("can append a rel timestamp to a link that already has one", function () {

            var transformedElem = actions.swapFile(elem2, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });

        it("can append a rel timestamp to a mal-formed assetUrl", function () {

            var transformedElem = actions.swapFile(elem3, "href");
            expected = wrapUrl("style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });

        it("can append a rel timestamp to a mal-formed assetUrl (2)", function () {

            var transformedElem = actions.swapFile(elem4, "href");
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });

        it("does NOT append a timestamp if disabled in options", function () {
            var scope = {
                options: {
                    timestamps: false
                }
            };
            var transformedElem = actions.swapFile(elem4, "href", scope);
            expected = wrapUrl("core/style.css");
            assert.equal(transformedElem.elem.href, expected);
        });
        it("does append a timestamp if enabled in options", function () {
            var scope = {
                options: {
                    timestamps: true
                }
            };
            var transformedElem = actions.swapFile(elem4, "href", scope);
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });
    });

    describe("swapping a file: e2e:", function () {

        var transformedElem, expected;
        var $head = $("head");
        beforeEach(function(){

            var link1 = $("<link>", {id: "link1", href: "core/style.css"});
            var link2 = $("<link>", {id: "link2", href: "core/style.css?rel=123456"});
            var link3 = $("<link>", {id: "link2", href: "core/style.min.css?rel=123456"});

            $head.append(link1, link2, link3);
        });
        afterEach(function () {
            $head.find("link").remove();
        });
        it("can swap the url of an asset for one with a timestamp", function () {
            transformedElem = browserSync.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });

        it("can swap the url of an asset that already has a timestamp (1)", function () {
            transformedElem = browserSync.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            expected = wrapUrl("core/style.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });
        it("can swap the url of an asset that already has a timestamp (2)", function () {
            transformedElem = browserSync.reloadEvent(scope, {assetFileName:"style.min.css", fileExtension: "css"}, actions);
            expected = wrapUrl("core/style.min.css") + timeStamp(transformedElem.timeStamp);
            assert.equal(transformedElem.elem.href, expected);
        });

        it("should swap the url but do a reload if the injectChanges options is true", function () {
            transformedElem = browserSync.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            sinon.assert.notCalled(reloadStub);
        });
        it("should NOT swap the url but do a reload if the injectChanges option is false", function () {
            scope.options.injectChanges = false;
            transformedElem = browserSync.reloadEvent(scope, {assetFileName:"style.css", fileExtension: "css"}, actions);
            sinon.assert.called(reloadStub);
        });
    });
});