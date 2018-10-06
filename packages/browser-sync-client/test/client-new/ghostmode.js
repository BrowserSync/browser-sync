describe("Ghost Mode", function(){
    var ghostMode = window.__bs_ghost_mode__;
    var bs        = window.__bs_stub__;
    it("Should init", function() {
        var spy = sinon.spy(ghostMode.plugins.scroll, "init");
        ghostMode.init(bs);
        sinon.assert.called(spy);
    });
});