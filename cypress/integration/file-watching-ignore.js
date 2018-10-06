describe('Watching folders', function() {
    context('files option', function () {
        beforeEach(function () {
            cy.visit(Cypress.env('BS_URL') + '/bower.html');
        });
        it('should reload single <link>', function () {
            cy.exec('touch packages/browser-sync/test/fixtures/bower_components/app.css');
            cy.get('[id="css-style"]').should($link => {
                const url = new URL($link.attr('href'));
                expect(url.search).to.contain('?browsersync=');
            });
        });
    });
});