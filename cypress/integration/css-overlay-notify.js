describe('CSS overlay notification', function() {
    beforeEach(function() {
        cy.visit(Cypress.env('BS_URL'));
    });
    it('should flash messages when css injected', function() {
        cy.exec('touch test/fixtures/**/style.css');
        cy.wait(500);
        cy.get('#__bs_notify__').should(function($elems) {
            expect($elems.length).to.equal(1);
            expect($elems.text()).to.equal('[LinkReplace] style.css');
        });
    });
});
