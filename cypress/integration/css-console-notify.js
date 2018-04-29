describe('CSS console notification', function() {
    beforeEach(function() {
        cy.visit(Cypress.env('BS_URL'));
    });
    it('should log message when css injected', function() {
        cy.window().then((win) => {
            const spy = cy.spy(win.console, "log");
            cy.exec('touch test/fixtures/**/style.css');
            cy.wait(1000).then(() => {
                expect(spy.getCall(0).args.slice(-1)[0]).to.equal('[LinkReplace] style.css');
            })
        });
    });
    it('should log 2 messages when 2 css files injected', function() {
        cy.window().then((win) => {
            const spy = cy.spy(win.console, "log");
            cy.exec('touch test/fixtures/**/*.css');
            cy.wait(1000).then(() => {
                expect(spy.callCount).to.equal(2);
                const calls = new Set([spy.getCall(0).args.slice(-1)[0], spy.getCall(1).args.slice(-1)[0]]);
                expect(calls.has('[LinkReplace] style.css')).to.be.true;
                expect(calls.has('[LinkReplace] stylesheet.css')).to.be.true;
            })
        });
    });
});
