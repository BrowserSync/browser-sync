describe('Connection notification (with logPrefix)', function() {
    beforeEach(function() {
        cy.visit(Cypress.env('BS_URL'));
    });
    it('should flash correct Connected message', function() {
        cy.wait(500);
        cy.get('#__bs_notify__').should(function($elems) {
            expect($elems.length).to.equal(1);
            expect($elems.text()).to.equal('WSK: connected');
        });
    });
    it('should log prefixed message when css is injected', function() {
        cy.window().then((win) => {
            const spy = cy.spy(win.console, "log");
            cy.exec('touch test/fixtures/**/style.css');
            cy.wait(1000).then(() => {
                expect(spy.getCall(0).args.slice(-1)[0]).to.equal('[LinkReplace] style.css');
                expect(spy.getCall(0).args.indexOf('WSK') > -1).to.be.true;
            })
        });
    });
});
