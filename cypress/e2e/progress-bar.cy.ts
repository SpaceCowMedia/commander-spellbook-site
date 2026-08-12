describe('Progress Bar', () => {
  it('is absent until a navigation starts', () => {
    cy.visit('/');

    cy.get('#progress-bar').should('not.exist');
  });

  it('appears during a slow navigation and clears once it settles', () => {
    // Delaying the data request keeps the bar on screen long enough to assert on.
    cy.intercept('/_next/data/**/search.json*', (req) => {
      req.on('response', (res) => {
        res.setDelay(1500);
      });
    }).as('searchData');

    cy.visit('/');
    cy.get('input[name=q]').type('monolith{enter}');

    cy.get('#progress-bar').should('exist');

    cy.wait('@searchData');
    cy.url().should('include', '/search/');
    cy.get('#progress-bar').should('not.exist');
  });
});
