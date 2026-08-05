describe('Search', () => {
  it('shows the combos matching a query and opens one of them', () => {
    cy.visit('/search/?q=monolith');

    cy.get('.card-name').should('contain', 'Basalt Monolith');

    cy.get('a[href*="/combo/"]').first().click();

    cy.url().should('include', '/combo/');
    cy.get('#combo-cards').should('contain', 'Basalt Monolith');
  });

  it('tells the user when nothing matches the query', () => {
    cy.visit(`/search/?q=${encodeURIComponent('card:"Not A Real Card"')}`);

    cy.contains('No Combos Found');
  });

  it('goes straight to the combo when a single one matches', () => {
    cy.visit('/search/?q=mesmeric');

    cy.url().should('include', '/combo/1-2');
  });
});

export {};
