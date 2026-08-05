describe('Find My Combos', () => {
  beforeEach(() => {
    cy.visit('/find-my-combos/');
    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
  });

  it('finds the combos of a decklist', () => {
    cy.get('#parse-decklist-input').click();

    cy.get('#decklist-card-count').should('contain', '2 cards');
    cy.get('#combos-in-deck-section').should('contain', '1 Combo Found').and('contain', 'Basalt Monolith');
  });

  it('can clear the decklist', () => {
    cy.get('#clear-decklist-input').click();

    cy.get('#decklist-input').should('be.empty');
    cy.get('#commander-input').should('be.empty');
  });
});

export {};
