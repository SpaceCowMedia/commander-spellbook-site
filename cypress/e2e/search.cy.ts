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

    cy.get('.forward-button').first().click();
    cy.url().should('include', 'page=2');
    expectTransitionType('page-turn-forward');

    cy.get('.back-button').first().click();
    cy.url().should('include', 'page=1');
    expectTransitionType('page-turn-back');

    cy.go('back');
    cy.url().should('include', 'page=2');
    expectTransitionType('page-turn-forward');

    cy.go('back');
    cy.url().should('not.include', 'page=');
    expectTransitionType('page-turn-back');

    cy.go('back');
    cy.location('pathname').should('eq', '/');
    expectTransitionType('no-animation');
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
