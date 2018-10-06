describe("Init method", function(){

    var index       = window.__bs_index__;
    var notify      = window.__bs_notify__;
    var ghostMode   = window.__bs_ghost_mode__;
    var bs          = window.__bs_stub__;
    var codeSync    = window.__bs_code_sync__;
    var notifySpy;
    var notifyFlashSpy;
    var ghostStub;
    var codeSyncStub;

    before(function () {
        notifySpy       = sinon.stub(notify, "init");
        notifyFlashSpy  = sinon.stub(notify, "flash");
        ghostStub       = sinon.stub(ghostMode, "init");
        codeSyncStub    = sinon.stub(codeSync, "init");
    });
    after(function () {
        notifySpy.restore();
        notifyFlashSpy.restore();
        ghostStub.restore();
        codeSyncStub.restore();
    });
    it("should initilize", function(){
        index.init(bs.options);
        sinon.assert.called(notifySpy);
        sinon.assert.called(notifyFlashSpy);
        sinon.assert.called(ghostStub);
        sinon.assert.called(codeSyncStub);
    });
});