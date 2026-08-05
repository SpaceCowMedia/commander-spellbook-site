describe('Update Submission', () => {
  it('submits an update and lists it among the submissions of the user', () => {
    cy.login();
    cy.visit('/submit-an-update/');

    cy.contains('button', 'Add Combo').click();
    cy.get('#variant-id-0').type('1-2');

    cy.get('textarea[placeholder^="e.g. The combo"]').type('The steps of this combo are in the wrong order.');
    cy.get('textarea[placeholder^="e.g. You can fix"]').type('Swap the first two steps.');

    cy.get('.submit-button').click();
    cy.contains('Thanks for submitting an update suggestion!');

    cy.contains('button', 'View my update submissions').click();
    cy.url().should('include', '/my-update-submissions');
    cy.contains('The steps of this combo are in the wrong order.');

    // Deleted so that the account is left as it was found.
    cy.get('button[title="Delete this submission"]').click();
    cy.contains('button', 'Delete').click();
    cy.contains('The steps of this combo are in the wrong order.').should('not.exist');
  });
});

export {};
