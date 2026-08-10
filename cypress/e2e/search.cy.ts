describe('Search', () => {
  it('shows the combos matching a query and opens one of them', () => {
    cy.visit('/search/?q=monolith');

    cy.get('.card-name').should('contain', 'Basalt Monolith');

    // Clicking the card names of a result shows the card instead of opening the combo.
    cy.get('a[href*="/combo/"]').first().find('.result').click();

    cy.url().should('include', '/combo/');
    cy.get('#combo-cards').should('contain', 'Basalt Monolith');
    // The query follows the result into the combo page to fill the search bar, without staying in
    // the address bar.
    cy.get('input[name=q]').should('have.value', 'monolith');
    cy.url().should('not.include', 'q=');
  });

  it('tells the user when nothing matches the query', () => {
    cy.visit(`/search/?q=${encodeURIComponent('card:"Not A Real Card"')}`);

    cy.contains('No Combos Found');
  });

  it('goes straight to the combo when a single one matches, keeping the query in the search bar', () => {
    cy.visit('/search/?q=mesmeric');

    cy.url().should('include', '/combo/1-2');
    cy.get('input[name=q]').should('have.value', 'mesmeric');
    // The query only travels to the combo page to fill the search bar: the address bar keeps the
    // plain combo link.
    cy.url().should('not.include', 'q=');
  });
});

export {};
