describe('UI', function () {
    context('Remote Debugger', function () {
        it('adds an element, in the way the UI does', function () {
            cy.visit(Cypress.env('BS_URL'));
            cy.get('#__bs_notify__').should('have.length', 1);
            cy.request('POST', `${Cypress.env('BS_URL')}/__browser_sync__`,
                JSON.stringify(["ui:element:add",
                    {
                        "src": "/browser-sync/pesticide.css",
                        "active": true,
                        "hidden": "",
                        "name": "pesticide",
                        "tagline": "Add simple CSS outlines to all elements. (powered by <span style='text-decoration: line-through'>Pesticide.io</span>)",
                        "context": "remote-debug",
                        "served": true,
                        "title": "CSS Outlining",
                        "type": "css",
                        "id": "__browser-sync-pesticide__",
                        "file": "/Users/shakyshane/sites/oss/browser-sync/node_modules/browser-sync-ui/lib/plugins/remote-debug/css/pesticide.min.css"
                    }
                ])
            ).then(res => {
                console.log(res);
            });
            cy.get('[id="__browser-sync-pesticide__"]').should('have.length', 1);
        });
    });
});
