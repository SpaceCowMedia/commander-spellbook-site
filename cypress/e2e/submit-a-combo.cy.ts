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

  it('keeps the other steps as they are when one is removed', () => {
    cy.login();
    cy.visit('/submit-a-combo/');

    cy.contains('button', 'Add Step').click();
    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').first().type('First step');
    cy.get('input[placeholder^="e.g. Cast"]').last().type('Second step');

    cy.get('input[placeholder^="e.g. Cast"]')
      .last()
      .then(([second]) => {
        cy.get('button[title="Remove step from combo"]').first().click();
        cy.get('input[placeholder^="e.g. Cast"]').should(($steps) => {
          expect($steps).to.have.length(1);
          expect($steps[0]).to.equal(second);
          expect($steps[0]).to.have.value('Second step');
        });
      });
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

  // A long editing session outlives the access token, so submitting starts by refreshing it. The refresh
  // being turned away for too many requests must not end the session: once the limit passes, it goes through.
  it('keeps the user logged in when refreshing the session is rate limited', () => {
    cy.login();
    cy.deleteComboSuggestions();
    cy.visit('/submit-a-combo/');

    CARD_NAMES.forEach(addCard);

    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').type('Tap Mesmeric Orb.');

    cy.contains('button', 'Add Feature').click();
    cy.get('input[placeholder^="Search for a feature"]').type('Infinite mana');

    // Every refresh is rate limited until the test lifts the limit, so it does not matter whether the
    // submission or a validation in the background is the first to ask for one.
    let rateLimited = true;
    cy.intercept('POST', '**/token/refresh/', (req) => {
      if (rateLimited) {
        req.reply({ statusCode: 429, headers: { 'Retry-After': '1' } });
      }
    }).as('refresh');
    cy.intercept('POST', '**/variant-suggestions/').as('createSuggestion');
    cy.clearCookie('csbJwt');

    cy.get('.submit-button').click();
    cy.wait('@refresh').its('response.statusCode').should('eq', 429);
    cy.contains(/too quickly|too many requests/i).should('be.visible');
    cy.contains('not authorized').should('not.exist');
    cy.getCookie('csbRefresh').should('exist');

    cy.then(() => {
      rateLimited = false;
    });
    cy.get('.submit-button').click();
    cy.wait('@createSuggestion').its('response.statusCode').should('be.lessThan', 300);
    cy.contains('Thanks for submitting a suggestion!');

    cy.deleteComboSuggestions();
  });

  // These three cards contain both seeded combos, so the submission is checked against them.
  it('warns before submitting a combo that includes combos already in the database', () => {
    cy.login();
    cy.deleteComboSuggestions();
    cy.visit('/submit-a-combo/');

    ['Basalt Monolith', 'Mesmeric Orb', 'Forsaken Monument'].forEach(addCard);

    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').type('Tap Mesmeric Orb.');

    cy.contains('button', 'Add Feature').click();
    cy.get('input[placeholder^="Search for a feature"]').type('Infinite mana');

    cy.intercept('POST', '**/find-my-combos*').as('findMyCombos');
    cy.intercept('POST', '**/variant-suggestions/').as('createSuggestion');

    cy.get('.submit-button').click();
    cy.wait('@findMyCombos');

    cy.contains('appears to include').should('be.visible');
    cy.contains('Included Combos').should('be.visible');

    // Declining leaves the dialog closed and sends nothing to the server.
    cy.contains('button', 'No').click();
    cy.contains('appears to include').should('not.exist');
    cy.get('@createSuggestion.all').should('have.length', 0);

    // Declining has to leave the form usable, not stuck mid-submit.
    cy.get('.submit-button').should('not.be.disabled');
  });

  it('warns before submitting a combo that uses Omniscience', () => {
    cy.login();
    cy.deleteComboSuggestions();
    cy.visit('/submit-a-combo/');

    addCard('Omniscience');

    // The warning shows up in the card's own panel while the form is being filled, before any submit attempt.
    cy.get('.submission-panel').last().contains('might be denied because it uses Omniscience').should('be.visible');

    cy.contains('button', 'Add Step').click();
    cy.get('input[placeholder^="e.g. Cast"]').type('Cast every spell in your hand.');

    cy.contains('button', 'Add Feature').click();
    cy.get('input[placeholder^="Search for a feature"]').type('Infinite mana');

    cy.intercept('POST', '**/find-my-combos*').as('findMyCombos');

    // The warning comes before any request, so declining must leave the server untouched.
    cy.get('.submit-button').click();
    cy.contains('appears to contain Omniscience').should('be.visible');
    cy.contains('button', 'No').click();
    cy.contains('appears to contain Omniscience').should('not.exist');
    cy.get('@findMyCombos.all').should('have.length', 0);

    cy.get('.submit-button').should('not.be.disabled');
  });

  it('warns about every card that lets you cast spells for free like Omniscience', () => {
    cy.login();
    cy.visit('/submit-a-combo/');

    addCard('Omniscience');
    addCard('Omnipresence');

    cy.get('.submission-panel').last().contains('might be denied because it uses Omnipresence').should('be.visible');

    cy.get('.submit-button').click();
    cy.contains('appears to contain Omniscience and Omnipresence, cards that are not accepted').should('be.visible');
    cy.contains('button', 'No').click();
    cy.contains('appears to contain').should('not.exist');
  });
});

export {};
