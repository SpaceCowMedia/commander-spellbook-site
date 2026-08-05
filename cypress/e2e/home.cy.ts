const buttons = [
  ['Advanced Search', '/advanced-search/'],
  ['Syntax', '/syntax-guide/'],
  ['Random', '/combo/'],
  ['Find My Combos', '/find-my-combos/'],
];

describe('Home Page', () => {
  it('searches from the search bar', () => {
    cy.visit('/');

    cy.get('input[name=q]').type('monolith result:infinite{enter}');

    cy.url().should('include', `/search/?q=${encodeURIComponent('monolith result:infinite')}`);
  });

  buttons.forEach(([label, destination]) => {
    it(`opens ${destination} with the ${label} button`, () => {
      cy.visit('/');

      cy.contains('.home-button', label).click();

      cy.url().should('include', destination);
    });
  });

  it('opens the submissions of a logged in user from the user menu', () => {
    cy.login();
    cy.visit('/');

    cy.get('#user-dropdown').should('contain', Cypress.env('username')).focus();
    cy.contains('button', 'My Submissions').click();

    cy.url().should('include', '/my-submissions');
  });

  it('signs a logged in user out', () => {
    cy.login();
    cy.visit('/');

    cy.get('#user-dropdown').focus();
    cy.contains('button', 'Sign out').click();

    cy.get('#user-dropdown').should('not.exist');
  });
});

export {};
