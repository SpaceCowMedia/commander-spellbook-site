const CARD_NAMES = ['Mesmeric Orb', 'Forsaken Monument'];

const addCard = (name: string) => {
  cy.contains('button', 'Add Card').click();

  cy.get('.submission-panel')
    .last()
    .within(() => {
      cy.get('input[placeholder="Search for a card..."]').type(name);
      cy.get('input[placeholder="Search for a card..."]').should('have.value', name);

      // Typed into the react-select input instead of clicking the control and relying on
      // cy.focused(), which yields whatever happens to hold focus at that moment.
      cy.get('.inputControl input').type('Battlefield{enter}', { force: true });
      cy.get('.inputControl').should('contain', 'Battlefield');
    });
};

describe('Combo Submission', () => {
  it('asks anonymous users to log in', () => {
    cy.visit('/submit-a-combo/');

    cy.url().should('include', '/login');
  });

  it('submits a combo and lists it among the submissions of the user', () => {
    cy.login();
    // A suggestion left behind by a previous attempt would make this one fail on a duplicate.
    cy.deleteComboSuggestions();
    cy.visit('/submit-a-combo/');

    CARD_NAMES.forEach(addCard);

    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').type('Tap Mesmeric Orb.');
    cy.get('input[placeholder^="e.g. Cast"]').should('have.value', 'Tap Mesmeric Orb.');

    cy.contains('button', 'Add Feature').click();
    cy.get('input[placeholder^="Search for a feature"]').type('Infinite mana');
    cy.get('input[placeholder^="Search for a feature"]').should('have.value', 'Infinite mana');

    // Guards against keystrokes landing in the wrong field, which would otherwise only surface as
    // the submission silently failing to go through.
    cy.get('input[placeholder="Search for a card..."]').should(($inputs) =>
      expect([...$inputs].map((input) => (input as HTMLInputElement).value)).to.deep.equal(CARD_NAMES),
    );

    // Submitting first checks the combo against the database, then creates the suggestion. Waiting on
    // both reports the status of whichever call fails, instead of timing out on the missing heading.
    cy.intercept('POST', '**/find-my-combos*').as('findMyCombos');
    cy.intercept('POST', '**/variant-suggestions/').as('createSuggestion');

    cy.get('.submit-button').click();
    cy.wait('@findMyCombos').its('response.statusCode').should('be.lessThan', 300);
    cy.wait('@createSuggestion').its('response.statusCode').should('be.lessThan', 300);
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
