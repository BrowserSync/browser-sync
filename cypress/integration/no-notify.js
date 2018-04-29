describe('disabled notification', function() {
    beforeEach(function() {
        cy.visit(Cypress.env('BS_URL'));
    });
    it('should not flash Connected message', function() {
        cy.wait(500);
        cy.get('#__bs_notify__').should('have.length', 0);
    });
    it('should not flash messages when css injected', function() {
        cy.exec('touch test/fixtures/**/style.css');
        cy.wait(500);
        cy.get('#__bs_notify__').should('have.length', 0);
    });
});
