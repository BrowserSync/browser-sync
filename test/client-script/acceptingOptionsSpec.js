describe("Browser Sync INIT", function () {

    var bs;
    var ghost;
    var scope;
    var methods;

    beforeEach(function(){
        scope = {};
        bs = window.BrowserSync;
        ghost = window.ghost;
        methods = bs;
    });

    it("should be accessible on the window for testing", function () {
        assert.notEqual(typeof bs, "undefined");
    });

    describe("Processing options for Ghostmode", function () {
        var spy;
        before(function () {
            spy = sinon.spy(methods, "initGhostMode");
        });
        afterEach(function () {
            spy.reset();
        });

        it("should set up ghost mode when enabled", function () {
            var options = {
                ghostMode: {
                    links: true,
                    scroll: true,
                    forms: true
                }
            };
            methods.processOptions(scope, options, ghost.utils, ghost.listeners);

            assert.equal(spy.called, true);
        });
        it("should NOT set up ghost mode disabled", function () {
            var options = {};
            methods.processOptions(scope, options, ghost.utils, ghost.listeners);

            assert.equal(spy.called, false);
        });
    });

    describe("Processing Options for Notify Element:", function () {

        var spy;
        before(function(){
            spy = sinon.spy(methods, "createNotifyElem");
        });

        afterEach(function () {
            spy.reset();
        });

        it("should create notify element when enabled", function () {
            var options = {
                notify: true
            };
            methods.processOptions(scope, options, ghost.utils, ghost.listeners);
            assert.equal(spy.called, true);
        });
        it("should NOT create notify element when Disabled", function () {
            var options = {
                notify: false
            };
            methods.processOptions(scope, options, ghost.utils, ghost.listeners);
            assert.equal(spy.called, false);
        });
    });
});
