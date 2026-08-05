const addCard = (name: string) => {
  cy.contains('button', 'Add Card').click();
  cy.get('input[placeholder="Search for a card..."]').last().type(name);
  cy.get('.inputControl').last().click();
  cy.focused().type('Battlefield{enter}');
};

describe('Combo Submission', () => {
  it('asks anonymous users to log in', () => {
    cy.visit('/submit-a-combo/');

    cy.url().should('include', '/login');
  });

  it('submits a combo and lists it among the submissions of the user', () => {
    cy.login();
    cy.visit('/submit-a-combo/');

    addCard('Mesmeric Orb');
    addCard('Forsaken Monument');

    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').type('Tap Mesmeric Orb.');

    cy.contains('button', 'Add Feature').click();
    cy.get('input[placeholder^="Search for a feature"]').type('Infinite mana');

    cy.get('.submit-button').click();
    cy.contains('Thanks for submitting a suggestion!');

    cy.contains('button', 'View my submissions').click();
    cy.url().should('include', '/my-submissions');
    cy.contains('Mesmeric Orb + Forsaken Monument');

    // The same combo cannot be suggested twice, so the submission is deleted to keep the test repeatable.
    cy.get('button[title="Delete this submission"]').click();
    cy.contains('button', 'Delete').click();
    cy.contains('Mesmeric Orb + Forsaken Monument').should('not.exist');
  });
});

export {};
