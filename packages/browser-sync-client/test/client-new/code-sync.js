describe("Code Sync", function () {
    var codeSync;
    var bs;
    var socketSpy;
    var stubs = [
        {
            id: "stub1",
            href: "http://localhost:8080/style.css"
        },
        {
            id: "stub2",
            href: "http://localhost:8080/style-with-rel.css?rel=213456"
        },
        {
            id: "stub3",
            href: "http://localhost:8080/stee/erqq/qefrerf/erferf/style-with-paths.css"
        }
    ];

    before(function () {
        bs = window.__bs_stub__;
        codeSync = window.__bs_code_sync__;
        utils = window.__bs_utils__;
        socketSpy = sinon.spy(bs.socket, "on");
    });
    after(function () {
        socketSpy.restore();
    });

    it("should register a listener on the socket", function () {
        var reloadStub = sinon.stub(codeSync, "reload").returns("reloadFunc");

        codeSync.init(bs);
        sinon.assert.calledWithExactly(socketSpy, "file:reload", "reloadFunc");

        var secondCall = socketSpy.getCall(1).args;
        assert.equal(secondCall[0], "browser:reload");

        reloadStub.restore();
    });

    describe("reload() with css files", function () {

        var dataStub;
        var reloadStub;
        before(function () {
            dataStub = {
                path: "css/styles/styles.css",
                basename: "styles.css",
                ext: "css",
                type: "inject",
                log: true
            };
            reloadStub = sinon.stub(codeSync, "reloadBrowser").returns(true);
        });
        after(function () {
            reloadStub.restore();
        });
        it("can call reload", function () {
            var matches = [
                {attr: "href", id: "match1", href: "http://localhst.com/css/styles.css?rel=123"}
            ];

            var elemsStub = sinon.stub(codeSync, "getElems").returns({elems: matches, attr: "href"});
            var matchesStub = sinon.stub(codeSync, "getMatches").returns(matches);

            var reload = codeSync.reload(bs);
            var actual = reload(dataStub);
            assert.equal(actual.elem.id, "match1");
            matchesStub.restore();
            elemsStub.restore();
        });
      it("ignores an event if blacklisted", function() {
        var reload = codeSync.reload(bs);
        var dataStub = {
          path: "css/styles/styles.css.map",
          basename: "styles.css.map",
          ext: "map",
          type: "reload",
          log: true
        };
        var elemsStub = sinon.stub(codeSync, "getElems");
        var actual = reload(dataStub);
        elemsStub.restore();
        assert.equal(actual, undefined);
        assert.equal(elemsStub.called, false);
      });
        it("swaps url when css file has existing params", function () {
            var matches = [
                {
                    attr: "href",
                    id: "match1",
                    href: "http://localhost.com/css/styles.css?name=kittie&id=||"
                }
            ];
            var clock = sinon.useFakeTimers();
            clock.tick(100);
            var elemsStub = sinon.stub(codeSync, "getElems").returns({elems: matches, attr: "href"});
            var matchesStub = sinon.stub(codeSync, "getMatches").returns(matches);
            var reload = codeSync.reload(bs);
            var actual = reload(dataStub);
            assert.equal(actual.elem.href, "http://localhost.com/css/styles.css?name=kittie&id=||&rel=100", "Should append rel attribute");
            matchesStub.restore();
            elemsStub.restore();
            clock.restore();
        });
        it("swaps url when css file has no params", function () {
            var matches = [
                {
                    attr: "href",
                    id: "match1",
                    href: "http://localhost.com/css/styles.css"
                }
            ];
            var clock = sinon.useFakeTimers();
            clock.tick(100);
            var elemsStub = sinon.stub(codeSync, "getElems").returns({elems: matches, attr: "href"});
            var matchesStub = sinon.stub(codeSync, "getMatches").returns(matches);
            var reload = codeSync.reload(bs);
            var actual = reload(dataStub);
            assert.equal(actual.elem.href, "http://localhost.com/css/styles.css?rel=100", "Should append rel attribute");
            matchesStub.restore();
            elemsStub.restore();
            clock.restore();
        });
        it("swaps url when css file has exising rel attr", function () {
            var matches = [
                {
                    attr: "href",
                    id: "match1",
                    href: "http://localhost.com/css/styles.css?rel=99"
                }
            ];
            var clock = sinon.useFakeTimers();
            clock.tick(100);
            var elemsStub = sinon.stub(codeSync, "getElems").returns({elems: matches, attr: "href"});
            var matchesStub = sinon.stub(codeSync, "getMatches").returns(matches);
            var reload = codeSync.reload(bs);
            var actual = reload(dataStub);
            assert.equal(actual.elem.href, "http://localhost.com/css/styles.css?rel=100", "Should append rel attribute");
            matchesStub.restore();
            elemsStub.restore();
            clock.restore();
        });
    });
    describe("reloading the browser", function () {
        var spy;
        var stub;
        beforeEach(function () {
            spy = sinon.spy();
            stub = sinon.stub(utils, "getWindow").returns({
                location: {
                    reload: spy
                }
            });
        });
        it("can reload the browser", function () {
            codeSync.reloadBrowser(true);
            sinon.assert.called(stub);
            sinon.assert.called(spy);
            stub.restore();
        });
        it("can reload the browser", function () {
            codeSync.reloadBrowser(false);
            sinon.assert.notCalled(spy);
            stub.restore();
        });
    });
    it("getTagName(): 1", function () {
        var actual = codeSync.getTagName("css");
        var expected = "link";
        assert.equal(actual, expected);
    });
    it("getTagName(): 2", function () {
        var actual = codeSync.getTagName("jpg");
        var expected = "img";
        assert.equal(actual, expected);
    });
    it("getAttr(): 1", function () {
        var actual = codeSync.getAttr("link");
        var expected = "href";
        assert.equal(actual, expected);
    });
    it("getAttr(): 2", function () {
        var actual = codeSync.getAttr("img");
        var expected = "src";
        assert.equal(actual, expected);
    });

    describe("matching elements", function () {

        it("can return multiple elements", function () {
            var matches = codeSync.getMatches(stubs, "*", "href");
            assert.equal(matches.length, 3);
        });
        it("can return element matches: 1", function () {
            var matches = codeSync.getMatches(stubs, "style.css", "href");
            var actual = matches[0];
            var expected = "stub1";
            assert.equal(actual.id, expected);
            assert.equal(matches.length, 1);
        });
        it("can return element matches: 2", function () {
            var matches = codeSync.getMatches(stubs, "style-with-rel.css", "href");
            var actual = matches[0];
            var expected = "stub2";
            assert.equal(actual.id, expected);
            assert.equal(matches.length, 1);
        });
        it("can return element matches: 3", function () {
            var matches = codeSync.getMatches(stubs, "style-with-paths.css", "href");
            var actual = matches[0];
            var expected = "stub3";
            assert.equal(actual.id, expected);
            assert.equal(matches.length, 1);
        });
        it("can return Multiple element matches: 1", function () {
            var elems = stubs.concat({
                id: "stub4",
                href: "http://localhost:8080/style.css"
            });
            var matches = codeSync.getMatches(elems, "style.css", "href");
            assert.equal(matches[0].id, "stub1");
            assert.equal(matches[1].id, "stub4");
            assert.equal(matches.length, 2);
        });
        it("can return only elements matching the same name: 1", function () {
            var elems = stubs.concat({
                id: "stub4",
                href: "http://localhost:8080/test-style.css"
            },
            {
                id: "stub5",
                href: "style.css"
            });
            var matches = codeSync.getMatches(elems, "style.css", "href");
            assert.equal(matches[0].id, "stub1");
            assert.equal(matches[1].id, "stub5");
            assert.equal(matches.length, 2);
        });
    });
    describe("Getting elements", function () {
        it("should return elements + attr", function () {
            var elemStub = sinon.stub(document, "getElementsByTagName").returns([
                {
                    id: "stub1",
                    href: "http://localhost:8080/style.css"
                }
            ]);
            var actual = codeSync.getElems("css");
            assert.equal(actual.elems[0].id, "stub1");
            assert.equal(actual.attr, "href");
            elemStub.restore();
        });
        it("should handle filenames with regexes", function () {
            var input = "http://localhost:8080/style.css?rel=123343";
            var expected = "http://localhost:8080/style.css";
            var actual = codeSync.getFilenameOnly(input);
            assert.equal(actual[0], expected);
        });
    });
    describe("Saving scroll position", function () {
        it("should save scroll position in window.name", function () {
            sinon.stub(window.__bs_utils__, "getWindow").returns({
                name: ""
            });
            var $window = window.__bs_utils__.getWindow();
            codeSync.saveScrollInName();
            window.__bs_emitter__.emit("browser:hardReload", {
                scrollPosition: {
                    x: 0,
                    y: 0
                }
            });
            assert.equal($window.name, "<<BS_START>>{\"bs\":{\"hardReload\":true,\"scroll\":{\"x\":0,\"y\":0}}}<<BS_END>>");
            window.__bs_utils__.getWindow.restore();
        });
        it("should save scroll position in window.name", function () {
            sinon.stub(window.__bs_utils__, "getWindow").returns({
                name: "NG_SOME_VALUE"
            });
            var $window = window.__bs_utils__.getWindow();
            codeSync.saveScrollInName();
            window.__bs_emitter__.emit("browser:hardReload", {
                scrollPosition: {
                    x: 0,
                    y: 0
                }
            });
            assert.equal($window.name, "NG_SOME_VALUE<<BS_START>>{\"bs\":{\"hardReload\":true,\"scroll\":{\"x\":0,\"y\":0}}}<<BS_END>>");
            window.__bs_utils__.getWindow.restore();
        });
        it("should save scroll position in window.name", function () {
            sinon.stub(window.__bs_utils__, "getWindow").returns({
                name: "NG_SOME_VALUE",
                scrollTo: function () {

                }
            });
            var spy = sinon.spy(window.__bs_utils__, "setScroll");
            var $window = window.__bs_utils__.getWindow();
            codeSync.saveScrollInName();
            window.__bs_emitter__.emit("browser:hardReload", {
                scrollPosition: {
                    x: 0,
                    y: 100
                }
            });
            assert.equal($window.name, "NG_SOME_VALUE<<BS_START>>{\"bs\":{\"hardReload\":true,\"scroll\":{\"x\":0,\"y\":100}}}<<BS_END>>");
            codeSync.saveScrollInName();
            assert.equal($window.name, "NG_SOME_VALUE");
            sinon.assert.calledWithExactly(spy, {x: 0, y: 100});
            window.__bs_utils__.getWindow.restore();
            window.__bs_utils__.setScroll.restore();
        });
    });
});
