const asQuery = (query: string) => `/search/?q=${encodeURIComponent(query).replace(/%20/g, '+')}`;

describe('Advanced Search Page', () => {
  beforeEach(() => {
    cy.visit('/advanced-search/');
  });

  it('builds a query out of the criteria of every kind', () => {
    cy.get('#card-names-input-0').type('monolith');

    cy.get('#card-name-inputs .plus-button-0').click();
    cy.get('#card-names-select-1').select('Does not have card with name');
    cy.get('#card-names-input-1').type('clock');

    cy.get('#number-of-cards-select-0').select('Contains at least x cards (number)');
    cy.get('#number-of-cards-input-0').type('2');

    cy.get('#card-type-line-input-0').type('artifact');
    cy.get('#color-identity-input-0').type('c');
    cy.get('#result-input-0').type('infinite');
    cy.get('#format-input-0-value').select('Vintage');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      asQuery('monolith -card:clock cards>=2 type:artifact ci:c result:infinite legal:vintage'),
    );
  });

  it('builds salt and price criteria with decimals', () => {
    cy.get('#salt-input-0').type('2.5');

    cy.get('#salt-inputs .plus-button-0').click();
    cy.get('#salt-select-1').select('Salt at most x (0 to 4)');
    cy.get('#salt-input-1').type('3.5');

    cy.get('#price-input-0').type('12.5');

    cy.get('#advanced-search-submit-button').click();

    // Only the seeded combo with a salt score of 2.60 matches, so the search opens it right away.
    cy.url().should('include', '/combo/1-2');
    cy.get('input[name=q]').should('have.value', 'salt>=2.5 salt<=3.5 cardkingdom<=12.5');
  });

  it('only accepts decimals where the search does', () => {
    cy.get('#salt-input-0').type('5');
    cy.contains('#salt-inputs .input-wrapper-0 .input-error', 'Use a number from 0 to 4 instead.');

    cy.get('#price-input-0').type('1e3');
    cy.contains('#price-inputs .input-wrapper-0 .input-error', 'Contains an invalid number.');

    cy.get('#popularity-input-0').type('2.5');
    cy.contains('#popularity-inputs .input-wrapper-0 .input-error', 'Contains a non-integer.');

    cy.get('#advanced-search-submit-button').click();

    cy.contains('#advanced-search-validation-error', 'Check for errors in your search terms before submitting.');
  });

  it('prevents searches when invalid queries are used', () => {
    cy.get('#step-input-0').type('not a number');
    cy.get('#step-select-0').select('Contains at least x (number)');

    cy.get('#advanced-search-submit-button').click();

    cy.contains('#advanced-search-validation-error', 'Check for errors in your search terms before submitting.');
    cy.contains('#step-inputs .input-wrapper-0 .input-error', 'Contains a non-integer. Use a full number instead.');
  });
});

export {};
