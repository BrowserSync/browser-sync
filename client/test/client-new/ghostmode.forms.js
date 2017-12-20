describe("The Forms Plugin", function () {

    var forms   = window.__bs_forms__;
    var bs      = __bs_stub__;
    var events  = __bs_events__;

    var inputStub, submitStub, togglesStub;

    before(function () {
        inputStub   = sinon.stub(__bs_inputs__, "init");
        togglesStub = sinon.stub(__bs_toggles__, "init");
        submitStub  = sinon.stub(__bs_submit__, "init");
    });

    afterEach(function () {
        inputStub.reset();
        submitStub.reset();
        togglesStub.reset();
    });

    after(function () {
        inputStub.restore();
        submitStub.restore();
        togglesStub.restore();
    });

    describe("Init: with defaults", function(){
        beforeEach(function () {
            forms.init(bs, events);
        });
        it("should init inputs", function() {
            sinon.assert.calledOnce(inputStub);
        });
        it("should init toggles", function() {
            sinon.assert.calledOnce(togglesStub);
        });
        it("should init submit", function() {
            sinon.assert.calledOnce(submitStub);
        });
    });
    describe("Init: with some disabled", function(){
        beforeEach(function () {
            forms.init({
                options: {
                    ghostMode: {
                        forms: {
                            submit: false,
                            toggles: true,
                            inputs: true
                        }
                    }
                }
            }, events);
        });
        it("should init inputs", function() {
            sinon.assert.calledOnce(inputStub);
        });
        it("should init toggles", function() {
            sinon.assert.calledOnce(togglesStub);
        });
        it("should init submit", function() {
            sinon.assert.notCalled(submitStub);
        });
    });
    describe("Init: with all enabled", function(){
        beforeEach(function () {
            forms.init({
                options: {
                    ghostMode: {
                        forms: true
                    }
                }
            }, events);
        });
        it("should init inputs", function() {
            sinon.assert.calledOnce(inputStub);
        });
        it("should init toggles", function() {
            sinon.assert.calledOnce(togglesStub);
        });
        it("should init submit", function() {
            sinon.assert.calledOnce(submitStub);
        });
    });
    describe("Init: with all Disabled", function(){
        beforeEach(function () {
            forms.init({
                options: {
                    ghostMode: {
                        forms: false
                    }
                }
            }, events);
        });
        it("should init inputs", function() {
            sinon.assert.notCalled(inputStub);
        });
        it("should init toggles", function() {
            sinon.assert.notCalled(togglesStub);
        });
        it("should init submit", function() {
            sinon.assert.notCalled(submitStub);
        });
    });
});