import { expectTransitionType, spyOnViewTransitions } from '../support/viewTransitions';

const COMBOS_IN_DECK = '#combos-in-deck-section';
const combosShown = () => cy.get(`${COMBOS_IN_DECK} a[href*="/combo/"]:has(.card-name)`);

describe('Find My Combos', () => {
  beforeEach(() => {
    cy.visit('/find-my-combos/');
    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
  });

  it('finds the combos of a decklist', () => {
    cy.get('#parse-decklist-input').click();

    cy.get('#decklist-card-count').should('contain', '2 cards');
    cy.get('#combos-in-deck-section').should('contain', '1 Combo Found').and('contain', 'Basalt Monolith');
  });

  it('can clear the decklist', () => {
    cy.get('#clear-decklist-input').click();

    cy.get('#decklist-input').should('be.empty');
    cy.get('#commander-input').should('be.empty');
  });

  it('turns the pages of the combos found', () => {
    // The test database is too small to fill a page, so the combo found is repeated over a page and a half.
    cy.intercept('POST', '**/find-my-combos*', (req) => {
      req.continue((res) => {
        const results = res.body?.results;
        const combo = results?.included?.[0];
        if (combo) {
          results.included = Array.from({ length: 150 }, (_, index) => ({ ...combo, id: `${combo.id}-${index}` }));
          res.body.next = null;
        }
      });
    });
    spyOnViewTransitions();
    cy.get('#parse-decklist-input').click();
    cy.get(COMBOS_IN_DECK).should('contain', '150 Combos Found');
    combosShown().should('have.length', 100);

    // While a page turns it is printed twice, once more for the sheet that turns over, and only once again after.
    cy.contains(`${COMBOS_IN_DECK} button`, 'View More').click();
    expectTransitionType('page-turn-forward');
    combosShown().should('have.length', 50);

    cy.contains(`${COMBOS_IN_DECK} button`, 'View Previous').click();
    expectTransitionType('page-turn-back');
    combosShown().should('have.length', 100);
  });

  it('fades in, unless it scrolls back down to the combos it found before', () => {
    const expectFade = (fades: boolean) =>
      cy.document().then((doc) => {
        if (!('startViewTransition' in doc)) {
          return;
        }
        cy.get<sinon.SinonSpy>('@startViewTransition').should((spy) => {
          expect(spy.args.some(([options]) => !options?.types?.includes('no-animation'))).to.equal(fades);
        });
        cy.get<sinon.SinonSpy>('@startViewTransition').invoke('resetHistory');
      });

    cy.visit('/about/');
    spyOnViewTransitions();
    cy.get('footer').contains('a', 'Find My Combos').click();
    cy.location('pathname').should('eq', '/find-my-combos/');
    expectFade(true);

    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
    cy.get('#parse-decklist-input').click();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    combosShown().first().find('.result').click();
    cy.location('pathname').should('include', '/combo/');
    cy.get('@startViewTransition').invoke('resetHistory');

    cy.get('footer').contains('a', 'Find My Combos').click();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    expectFade(false);
  });

  it('slides between the combos and the bracket of the deck', () => {
    spyOnViewTransitions();
    cy.get('#parse-decklist-input').click();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');

    cy.contains('button', 'Bracket Info').click();
    expectTransitionType('tab-forward');
    cy.get(COMBOS_IN_DECK).should('not.exist');

    cy.contains('button', /^Combos/).click();
    expectTransitionType('tab-back');
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
  });
});

export {};
