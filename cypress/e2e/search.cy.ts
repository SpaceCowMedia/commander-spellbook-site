const PAGE_SIZE = 50;

// Browsers without view transitions skip these checks.
const expectTransitionType = (type: string) => {
  cy.document().then((doc) => {
    if (!('startViewTransition' in doc)) {
      return;
    }
    cy.get<sinon.SinonSpy>('@startViewTransition').should((spy) => {
      expect(spy.args.some(([options]) => options?.types?.includes(type))).to.equal(true);
    });
    cy.get<sinon.SinonSpy>('@startViewTransition').invoke('resetHistory');
  });
};

// Going back to a page whose data it already has, Next renders it during the popstate event, where React commits the
// transition synchronously, without starting a view transition at all.
const expectNoAnimation = () => {
  cy.document().then((doc) => {
    if (!('startViewTransition' in doc)) {
      return;
    }
    cy.get<sinon.SinonSpy>('@startViewTransition').should((spy) => {
      expect(spy.args.every(([options]) => options?.types?.includes('no-animation'))).to.equal(true);
    });
  });
};

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

  it('sorts the combos by salt, showing the score of each', () => {
    cy.visit('/search/?q=monolith&sort=salt');

    cy.get('#sort-combos-select').should('have.value', 'salt');
    cy.get('.sort-footer').first().should('contain', 'Salt 2.60 / 4 (5 votes)');
    cy.get('.sort-footer').last().should('contain', 'Too few salt votes');
  });

  it('turns the page when moving between result pages', () => {
    // The test database is too small to fill a page, so every results page repeats a real combo.
    let sample: { id: string } | undefined;
    cy.intercept('/_next/data/**/search.json*', (req) => {
      req.continue((res) => {
        const pageProps = res.body?.pageProps;
        sample ??= pageProps?.combos?.[0];
        if (sample && pageProps) {
          const combo = sample;
          pageProps.combos = Array.from({ length: PAGE_SIZE }, (_, index) => ({
            ...combo,
            id: `${combo.id}-${index}`,
          }));
        }
      });
    });

    cy.visit('/');
    cy.document().then((doc) => {
      if ('startViewTransition' in doc) {
        cy.spy(doc, 'startViewTransition').as('startViewTransition');
      }
    });
    cy.get('input[name=q]').type('monolith{enter}');
    cy.url().should('include', '/search/');

    // While a page turns it is printed twice, once more for the sheet that turns over, and only once again after.
    const expectOnePrint = () => cy.get('a[href*="/combo/"]:has(.card-name)').should('have.length', PAGE_SIZE);

    cy.get('.forward-button').first().click();
    cy.url().should('include', 'page=2');
    expectTransitionType('page-turn-forward');
    expectOnePrint();

    cy.get('.forward-button').first().click();
    cy.url().should('include', 'page=3');
    expectTransitionType('page-turn-forward');
    expectOnePrint();

    cy.get('.back-button').first().click();
    cy.url().should('include', 'page=2');
    expectTransitionType('page-turn-back');
    expectOnePrint();

    cy.go('back');
    cy.url().should('include', 'page=3');
    expectTransitionType('page-turn-forward');
    expectOnePrint();

    cy.go('back');
    cy.url().should('include', 'page=2');
    expectTransitionType('page-turn-back');
    expectOnePrint();

    cy.go('back');
    cy.url().should('not.include', 'page=');
    expectTransitionType('page-turn-back');
    expectOnePrint();

    cy.go('back');
    cy.location('pathname').should('eq', '/');
    cy.get('.home-button').should('exist');
    expectNoAnimation();
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
