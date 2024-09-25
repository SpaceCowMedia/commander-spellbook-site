describe('Home Page', () => {
  it('can enter a query', () => {
    cy.visit('/');

    cy.get('input[name=q]').type('mesmeric result:infinite{enter}');

    cy.url().should('include', '/search');
  });

  it('can load a random combo', () => {
    cy.visit('/');

    cy.get('a.random-button').click();

    cy.url().should('include', '/combo');
  });
});

export {};
