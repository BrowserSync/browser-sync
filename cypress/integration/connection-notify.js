describe('Connection notification', function() {
    beforeEach(function() {
        cy.visit(Cypress.env('BS_URL'));
    });
    it('should flash Connected message', function() {
        cy.wait(500);
        cy.get('#__bs_notify__').should(function($elems) {
            expect($elems.length).to.equal(1);
            expect($elems.text()).to.equal('Browsersync: connected');
        });
    });
});
