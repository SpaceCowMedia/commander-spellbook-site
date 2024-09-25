describe('Advanced Search Page', () => {
  it('can search card names in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-name-inputs input.input').should('have.length', 1);
    cy.get('#card-names-input-0').type('staff');

    cy.get('#card-name-inputs .plus-button-0').click();
    cy.get('#card-name-inputs input.input').should('have.length', 2);

    cy.get('#card-names-select-1').select('Has card with exact name');
    cy.get('#card-names-input-1').type('basalt monolith');

    cy.get('#card-name-inputs .plus-button-1').click();
    cy.get('#card-name-inputs input.input').should('have.length', 3);

    cy.get('#card-names-input-2').type('clock');
    cy.get('#card-names-select-2').select('Does not have card with name');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      `/search/?q=${encodeURIComponent('staff card="basalt monolith" -card:clock').replace(/%20/g, '+')}`,
    );
  });

  it('can search card amounts in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-amount-inputs input.input').should('have.length', 1);
    cy.get('#number-of-cards-select-0').select('Contains at least x cards (number)');
    cy.get('#number-of-cards-input-0').type('3');

    cy.get('#card-amount-inputs .plus-button-0').click();
    cy.get('#card-amount-inputs input.input').should('have.length', 2);

    cy.get('#number-of-cards-select-1').select('Contains less than x cards (number)');
    cy.get('#number-of-cards-input-1').type('5');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('cards>=3 cards<5').replace(/%20/g, '+')}`);
  });

  it('can search card types in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-type-inputs input.input').should('have.length', 1);
    cy.get('#card-type-line-input-0').type('creature');

    cy.get('#card-type-inputs .plus-button-0').click();
    cy.get('#card-type-inputs input.input').should('have.length', 2);

    cy.get('#card-type-line-input-1').type('artifact');
    cy.get('#card-type-line-select-1').select('Does not contain the phrase');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('type:creature -type:artifact').replace(/%20/g, '+')}`);
  });

  it('can search color identity in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#color-identity-inputs input.input').should('have.length', 1);
    cy.get('#color-identity-input-0').type('wubr');

    cy.get('#color-identity-inputs .plus-button-0').click();
    cy.get('#color-identity-inputs input.input').should('have.length', 2);

    cy.get('#color-identity-select-1').select('Is exactly the color identity');
    cy.get('#color-identity-input-1').type('grixis');

    cy.get('#color-identity-inputs .plus-button-1').click();

    cy.get('#color-identity-input-2').type('2');
    cy.get('#color-identity-select-2').select('Contains at least x colors (number)');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('ci:wubr ci=grixis colors>=2').replace(/%20/g, '+')}`);
  });

  it('can search oracle text', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-oracle-inputs input.input').should('have.length', 1);
    cy.get('#oracle-text-input-0').type('draw');

    cy.get('#card-oracle-inputs .plus-button-0').click();
    cy.get('#card-oracle-inputs input.input').should('have.length', 2);

    cy.get('#oracle-text-input-1').type('untap');
    cy.get('#oracle-text-select-1').select('Does not contain the phrase');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('oracle:draw -oracle:untap').replace(/%20/g, '+')}`);
  });

  it('can search card keywords in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-keywords-inputs input.input').should('have.length', 1);
    cy.get('#card-keyword-input-0').type('haste');

    cy.get('#card-keywords-inputs .plus-button-0').click();
    cy.get('#card-keywords-inputs input.input').should('have.length', 2);

    cy.get('#card-keyword-input-1').type('flying');
    cy.get('#card-keyword-select-1').select('Does not have the keyword');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      `/search/?q=${encodeURIComponent('keyword:haste -keyword:flying').replace(/%20/g, '+')}`,
    );
  });

  it('can search for mana values in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#card-mana-value-inputs input.input').should('have.length', 1);
    cy.get('#mana-value-input-0').type('2');

    cy.get('#card-mana-value-inputs .plus-button-0').click();
    cy.get('#card-mana-value-inputs input.input').should('have.length', 2);

    cy.get('#mana-value-input-1').type('4');
    cy.get('#mana-value-select-1').select('Has a mana value of at least x (number)');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('mv=2 mv>=4').replace(/%20/g, '+')}`);
  });

  it('can search prerequisites in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#prerequisite-inputs input.input').should('have.length', 1);
    cy.get('#prerequisite-input-0').type('mana');

    cy.get('#prerequisite-inputs button').click();
    cy.get('#prerequisite-inputs input.input').should('have.length', 2);

    cy.get('#prerequisite-input-1').type('untap all');
    cy.get('#prerequisite-select-1').select('Does not contain the phrase');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      `/search/?q=${encodeURIComponent('prereq:mana -prereq:"untap all"').replace(/%20/g, '+')}`,
    );
  });

  it('can search steps in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#step-inputs input.input').should('have.length', 1);
    cy.get('#step-input-0').type('mana');

    cy.get('#step-inputs button').click();
    cy.get('#step-inputs input.input').should('have.length', 2);

    cy.get('#step-input-1').type('untap all');
    cy.get('#step-select-1').select('Does not contain the phrase');

    cy.get('#step-inputs .plus-button-1').click();
    cy.get('#step-inputs input.input').should('have.length', 3);

    cy.get('#step-input-2').type('5');
    cy.get('#step-select-2').select('Contains at least x (number)');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      `/search/?q=${encodeURIComponent('step:mana -step:"untap all" steps>=5').replace(/%20/g, '+')}`,
    );
  });

  it('can search results in combo', () => {
    cy.visit('/advanced-search/');

    cy.get('#result-inputs input.input').should('have.length', 1);
    cy.get('#result-input-0').type('mana');

    cy.get('#result-inputs button').click();
    cy.get('#result-inputs input.input').should('have.length', 2);

    cy.get('#result-input-1').type('infinite');
    cy.get('#result-select-1').select('Does not contain the phrase');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('result:mana -result:infinite').replace(/%20/g, '+')}`);
  });

  it('can search by commander', () => {
    cy.visit('/advanced-search/');

    cy.get('#commander-inputs input.input').should('have.length', 1);
    cy.get('#commander-input-0').type('thrasios');

    cy.get('#commander-inputs button').click();
    cy.get('#commander-inputs input.input').should('have.length', 2);

    cy.get('#commander-input-1').type('tymna');
    cy.get('#commander-select-1').select('Does not require a commander whose name contains the phrase');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should(
      'include',
      `/search/?q=${encodeURIComponent('commander:thrasios -commander:tymna').replace(/%20/g, '+')}`,
    );
  });

  it('can search by price', () => {
    cy.visit('/advanced-search/');

    cy.get('#price-inputs input.input').should('have.length', 1);
    cy.get('#price-input-0').type('3');

    cy.get('#price-inputs button').click();
    cy.get('#price-inputs input.input').should('have.length', 2);

    cy.get('#price-input-1').type('2');
    cy.get('#price-select-1').select('Costs at least x');

    cy.get("#vendor input[type='radio'][value='cardmarket']").check();

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('cardmarket<=3 cardmarket>=2').replace(/%20/g, '+')}`);
  });

  it('can search by popularity', () => {
    cy.visit('/advanced-search/');

    cy.get('#popularity-inputs input.input').should('have.length', 1);
    cy.get('#popularity-input-0').type('3');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('decks>=3').replace(/%20/g, '+')}`);
  });

  it('can search by format legality', () => {
    cy.visit('/advanced-search/');

    cy.get('#format-input-0-value').select('Vintage');

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('legal:vintage').replace(/%20/g, '+')}`);
  });

  it('can search for previewed combos', () => {
    cy.visit('/advanced-search/');

    cy.get("#spoiler-tag input[type='radio'][value='true']").check();

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('is:spoiler').replace(/%20/g, '+')}`);
  });

  it('can search for featured combos', () => {
    cy.visit('/advanced-search/');

    cy.get("#featured-tag input[type='radio'][value='true']").check();

    cy.get('#advanced-search-submit-button').click();

    cy.url().should('include', `/search/?q=${encodeURIComponent('is:featured').replace(/%20/g, '+')}`);
  });

  it('prevents searches when queries are empty', () => {
    cy.visit('/advanced-search/');

    cy.get('#advanced-search-submit-button').click();

    cy.contains('#advanced-search-validation-error', 'No search queries entered.');
  });

  it('prevents searches when invalid queries are used', () => {
    cy.visit('/advanced-search/');

    cy.get('#step-input-0').type('not a number');
    cy.get('#step-select-0').select('Contains at least x (number)');

    cy.get('#advanced-search-submit-button').click();

    cy.contains('#advanced-search-validation-error', 'Check for errors in your search terms before submitting.');
    cy.contains('#step-inputs .input-wrapper-0 .input-error', 'Contains a non-integer. Use a full number instead.');
  });
});

export {};
