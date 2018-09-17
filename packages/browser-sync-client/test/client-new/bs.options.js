describe("BrowserSync instance", function(){
    var bs;
    before(function () {
        bs = new window.__bs();
    });
    it("should exist", function () {
        assert.ok(typeof bs.canSync === "function");
    });
    it("syncs if on same page as emitter", function () {
        var actual = bs.canSync({url: window.location.pathname});
        assert.equal(actual, true);
    });
    it("refuses to sync if on diff page", function () {
        var actual = bs.canSync({url: "/index.html"}); // Test url will be something like 'context.html'
        assert.equal(actual, false);
    });
});

describe("BrowserSync options", function(){

    var bs;

    before(function () {
        bs = new window.__bs({
            ghostMode: {
                scroll: true,
                forms: {
                    toggles: false,
                    inputs: {
                        one: {
                            two: {
                                three: "katz"
                            }
                        }
                    }
                }
            },
            codeSync: true
        });
    });

    it("returns set values", function () {
        assert.ok(bs.getOption("codeSync"), true);
    });

    it("returns false for undefined values", function () {
        assert.equal(bs.getOption("randomOpt"), false);
    });

    it("returns deep values (2 levels)", function () {
        assert.equal(bs.getOption("ghostMode.scroll"), true);
    });
    it("returns deep values (2 levels) when undefined", function () {
        assert.equal(bs.getOption("ghostMode.scrol"), false);
    });
    it("returns deep values (3 levels)", function () {
        assert.equal(bs.getOption("ghostMode.forms.toggles"), false);
    });
    it("returns deep values (3 levels)", function () {
        assert.deepEqual(bs.getOption("ghostMode.forms.inputs"), {
            one: {
                two: {
                    three: "katz"
                }
            }
        });
    });
    it("returns deep values (6 levels)", function () {
        assert.equal(bs.getOption("ghostMode.forms.inputs.one.two.three"), "katz");
    });
});