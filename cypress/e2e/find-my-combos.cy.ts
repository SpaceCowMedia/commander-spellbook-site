import { expectTransitionType, spyOnViewTransitions } from '../support/viewTransitions';

const COMBOS_IN_DECK = '#combos-in-deck-section';
const COMMANDER_COMBOS = '#commander-combos-section';
const combosShown = () => cy.get(`${COMBOS_IN_DECK} a[href*="/combo/"]:has(.card-name)`);

describe('Find My Combos', () => {
  beforeEach(() => {
    cy.visit('/find-my-combos/');
    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
  });

  it('finds the combos of a decklist, which open in a new tab', () => {
    cy.get('#parse-decklist-input').click();

    cy.get('#decklist-card-count').should('contain', '2 cards');
    cy.get('#combos-in-deck-section').should('contain', '1 Combo Found').and('contain', 'Basalt Monolith');
    combosShown().should('have.attr', 'target', '_blank');
  });

  it('lists the combos using the commander and searches all of them', () => {
    cy.get('#commander-input').type('Basalt Monolith');
    cy.get('#parse-decklist-input').click();

    cy.get(COMMANDER_COMBOS)
      .should('contain', '2 Combos Found Using Your Commander')
      .and('contain', 'Forsaken Monument (not in deck)');
    cy.contains(`${COMMANDER_COMBOS} a`, 'Show all 2 combos').click();

    cy.location('pathname').should('eq', '/search/');
    cy.get('input[name=q]').should(
      'have.value',
      'card="Basalt Monolith" ci:c (-is:commander OR commander="Basalt Monolith") (legal:commander)',
    );
    cy.get('a[href*="/combo/"]:has(.card-name)').should('have.length', 2);
  });

  it('turns and sorts the combos using the commander like a search, fetching each page once', () => {
    // The test database has two combos using the commander, so they are repeated over a page and a quarter.
    const requests: unknown[] = [];
    let combo: { id: string };
    cy.intercept('GET', '**/variants/*', (req) => {
      if (!String(req.query.q).includes('card="Basalt Monolith"')) {
        return;
      }
      requests.push(`${req.query.groupByCombo} ${req.query.offset ?? 0}`);
      req.continue((res) => {
        combo ??= res.body.results[0];
        const offset = Number(req.query.offset ?? 0);
        res.body.count = 15;
        res.body.results = Array.from({ length: Math.min(12, 15 - offset) }, (_, index) => ({
          ...combo,
          id: `${combo.id}-${offset + index}`,
        }));
      });
    });
    spyOnViewTransitions();
    cy.get('#commander-input').type('Basalt Monolith');
    cy.get('#parse-decklist-input').click();
    const commanderCombosShown = () => cy.get(`${COMMANDER_COMBOS} a[href*="/combo/"]:has(.card-name)`);
    commanderCombosShown().should('have.length', 12);

    cy.get(`${COMMANDER_COMBOS} .back-button`).should('have.length', 2).and('not.be.visible');
    cy.get(`${COMMANDER_COMBOS} .forward-button`).should('have.length', 2).last().click();
    expectTransitionType('page-turn-forward');
    commanderCombosShown().should('have.length', 3);
    cy.get(`${COMMANDER_COMBOS} .forward-button`).should('not.be.visible');

    cy.get(`${COMMANDER_COMBOS} .back-button`).first().click();
    expectTransitionType('page-turn-back');
    commanderCombosShown().should('have.length', 12);
    cy.get('#commander-variant-grouping input[value="ungrouped"]').should('be.checked');

    cy.get(`${COMMANDER_COMBOS} .forward-button`).first().click();
    cy.contains('#commander-variant-grouping label', 'By combo').click();
    expectTransitionType('resort');
    cy.get(`${COMMANDER_COMBOS} .back-button`).should('not.be.visible');
    cy.contains(`${COMMANDER_COMBOS} a`, 'Show all 15 combos')
      .should('have.attr', 'href')
      .and('contain', 'groupByCombo=true');
    cy.wrap(requests).should('deep.equal', ['false 0', 'false 12', 'true 0']);
  });

  // The test database has a single variant per combo, so the combo found gets more variants of its own, which replace
  // Mesmeric Orb, and the categories of variants found get the ones that the test puts in them.
  const addVariants = (
    categorize: (results: Record<string, unknown[]>, variant: (id: string, card: string) => object) => void,
  ) =>
    cy.intercept('POST', '**/find-my-combos*', (req) => {
      req.continue((res) => {
        const results = res.body?.results;
        const combo = results?.included?.[0];
        if (combo) {
          const [basalt, orb] = combo.uses;
          categorize(results, (id, card) => ({
            ...combo,
            id: `${combo.id}-${id}`,
            popularity: 0,
            uses: [basalt, { ...orb, card: { ...orb.card, id: 0, name: card } }],
          }));
        }
      });
    });

  it('groups the variants of a combo found into its most popular one and the replacements of its cards', () => {
    // One more in the deck, with Sol Ring, and two the deck misses a card of: Mana Vault, and Lotus Petal with a color.
    addVariants((results, variant) => {
      results.included = [...results.included, variant('10', 'Sol Ring')];
      results.almostIncluded = [...results.almostIncluded, variant('11', 'Mana Vault')];
      results.almostIncludedByAddingColors = [{ ...variant('12', 'Lotus Petal'), identity: 'W' }];
    });
    spyOnViewTransitions();
    cy.get('#parse-decklist-input').click();

    cy.get('#combos-in-deck-grouping input[value="combo"]').should('be.checked');
    cy.get(COMBOS_IN_DECK).should('contain', '2 Combos Found').and('contain', '+ 1/3 variants in your deck');
    cy.get(`${COMBOS_IN_DECK} .card-name:contains("Basalt Monolith")`).should('have.length', 1);
    cy.get(`${COMBOS_IN_DECK} li`).should('have.length', 1).and('contain', 'Sol Ring');

    cy.contains('#combos-in-deck-grouping label', 'Ungrouped').click();
    expectTransitionType('regroup');
    combosShown().should('have.length', 2);
    cy.get(`${COMBOS_IN_DECK} li`).should('not.exist');
    cy.contains('#combos-in-deck-grouping label', 'By combo').click();
    expectTransitionType('regroup');
    cy.get(`${COMBOS_IN_DECK} li`).should('have.length', 1);

    cy.contains(`${COMBOS_IN_DECK} [role="button"]`, 'Sol Ring').find('.result').click();
    cy.get('dialog[open]').should('contain', '4 variants of the same combo');
    cy.get('dialog[open] h4').should(($headings) =>
      expect(Cypress._.map($headings, 'textContent')).to.deep.equal([
        '2 in your deck',
        '1 missing one card',
        '1 missing one card, with additional colors',
      ]),
    );
    cy.get('dialog[open] a[href*="/combo/"]').should('have.length', 2);
    cy.get('dialog[open] a[href*="/combo/1-2-10"] strong').should('have.text', 'Sol Ring');
    cy.get('dialog[open] a[href*="/combo/1-2-10"]').should('not.contain', 'Mesmeric Orb');
    cy.contains('dialog[open] [role="button"]', 'Mana Vault').should('contain', '1 combo');

    cy.contains('dialog[open] h4', 'with additional colors').next().contains('label', 'Ungrouped').click();
    cy.get('dialog[open] a[href*="/combo/1-2-12"] strong').should('have.text', 'Lotus Petal (not in deck)');
    cy.contains('dialog[open] [role="button"]', 'Lotus Petal').should('not.exist');
    cy.contains('dialog[open] a[href*="/combo/"]', 'Mesmeric Orb')
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'href')
      .and('match', /^\/combo\/1-2\/?$/);
  });

  it('groups the combos missing a card by that card, unless switched to their combos or to no grouping', () => {
    addVariants((results, variant) => {
      results.almostIncluded = [variant('11', 'Mana Vault'), variant('12', 'Lotus Petal')];
    });
    spyOnViewTransitions();
    cy.get('#parse-decklist-input').click();
    const section = '#potential-combos-in-deck-section';

    cy.get(`${section} input[value="card"]`).should('be.checked');
    cy.get(section).should('contain', 'Grouped into 2 missing-card clusters');

    cy.contains(`${section} label`, 'By combo').click();
    expectTransitionType('regroup');
    cy.get(section).should('not.contain', 'missing-card clusters').and('contain', '+ 1/2 variants missing one card');
    cy.get(`${section} li`).should('have.length', 1).and('contain', 'Lotus Petal');

    cy.contains(`${section} label`, 'Ungrouped').click();
    expectTransitionType('regroup');
    cy.get(`${section} a[href*="/combo/"]:has(.card-name)`).should('have.length', 2);

    cy.contains(`${section} label`, 'By combo').click();
    cy.contains(`${section} [role="button"]`, 'Lotus Petal').find('.result').click();
    // Under the suggestions, the suggested variants come first, then those found in the deck.
    cy.get('dialog[open]').should('contain', '3 variants of the same combo');
    cy.get('dialog[open] h4').should(($headings) =>
      expect(Cypress._.map($headings, 'textContent')).to.deep.equal(['2 missing one card', '1 in your deck']),
    );
  });

  it('groups the combos missing the same card by combo, when some are variants of the same one', () => {
    addVariants((results, variant) => {
      results.almostIncluded = [variant('11', 'Mana Vault'), variant('13', 'Mana Vault')];
    });
    cy.get('#parse-decklist-input').click();

    cy.contains('#potential-combos-in-deck-section [role="button"]', 'Mana Vault').contains('Mana Vault').click();
    cy.get('dialog[open] input[value="combo"]').should('be.checked');
    cy.get('dialog[open]').should('contain', '+ 1/2 variants missing one card');

    // A modal opened from another groups nothing, or each could open one more without end.
    cy.contains('dialog[open] [role="button"]', 'Mana Vault').find('.result').first().click();
    cy.get('dialog[open]').should('have.length', 2);
    cy.get('dialog[open]')
      .last()
      .within(() => {
        cy.contains('h4', '2 missing one card');
        cy.get('[role="radiogroup"]').should('not.exist');
        cy.get('a[href*="/combo/1-2-11"], a[href*="/combo/1-2-13"]').should('have.length', 2);
      });
  });

  it('links the missing card of a group to its page, without grouping its lone combo', () => {
    cy.get('#decklist-input').clear();
    cy.get('#decklist-input').type('1 Basalt Monolith');
    cy.get('#parse-decklist-input').click();

    cy.contains('#potential-combos-in-deck-section [role="button"]', 'Mesmeric Orb').contains('Mesmeric Orb').click();
    cy.get('dialog[open] a[href*="/combo/"]:has(.card-name)').should('have.length', 1);
    cy.get('dialog[open] [role="radiogroup"]').should('not.exist');
    cy.get('dialog[open] a[href="/card/2/"]')
      .should('contain', 'Missing card')
      .and('have.attr', 'title', 'Open Mesmeric Orb and its combos')
      .click();
    cy.location('pathname').should('eq', '/card/2/');
  });

  it('can clear the decklist', () => {
    cy.get('#clear-decklist-input').click();

    cy.get('#decklist-input').should('be.empty');
    cy.get('#commander-input').should('be.empty');
  });

  it('explains the filter query the combos were found with, not the one being edited', () => {
    cy.intercept('GET', '**/explain-query*', (req) => {
      req.reply({ body: { q: req.query.q, explanation: `combos matching ${req.query.q}.` } });
    });
    cy.visit('/find-my-combos/');
    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
    const explanation = (query: string) => ` Currently filtering for combos matching ${query}.`;
    cy.get('#combo-filter-query-explanation').should('have.text', explanation('legal:commander'));

    cy.get('#combo-filter-query-input').clear();
    cy.get('#combo-filter-query-input').type('ci:c');
    cy.get('#combo-filter-query-explanation').should('have.text', explanation('legal:commander'));

    cy.get('#parse-decklist-input').click();
    cy.get('#combo-filter-query-explanation').should('have.text', explanation('ci:c'));
  });

  it('turns the pages of the combos found', () => {
    // The test database is too small to fill a page, so the combo found is repeated over a page and a half, each
    // copy from a combo of its own so that they are not grouped together.
    cy.intercept('POST', '**/find-my-combos*', (req) => {
      req.continue((res) => {
        const results = res.body?.results;
        const combo = results?.included?.[0];
        if (combo) {
          results.included = Array.from({ length: 150 }, (_, index) => ({
            ...combo,
            id: `${combo.id}-${index}`,
            of: [{ id: 1000 + index }],
          }));
          res.body.next = null;
        }
      });
    });
    spyOnViewTransitions();
    cy.get('#parse-decklist-input').click();
    cy.get(COMBOS_IN_DECK).should('contain', '150 Combos Found');
    combosShown().should('have.length', 100);

    // While a page turns it is printed twice, once more for the sheet that turns over, and only once again after.
    cy.get(`${COMBOS_IN_DECK} .forward-button`).first().click();
    expectTransitionType('page-turn-forward');
    combosShown().should('have.length', 50);

    cy.get(`${COMBOS_IN_DECK} .back-button`).last().click();
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
    cy.get('footer').contains('a', 'About').click();
    cy.location('pathname').should('eq', '/about/');
    cy.get('@startViewTransition').invoke('resetHistory');

    cy.get('footer').contains('a', 'Find My Combos').click();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    expectFade(false);
  });

  it('scrolls back down to the combos it found when coming back to them, but not once reloaded', () => {
    cy.get('#parse-decklist-input').click();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    cy.get('footer').contains('a', 'About').click();
    cy.location('pathname').should('eq', '/about/');

    cy.go('back');
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    cy.window().its('scrollY').should('be.greaterThan', 0);

    cy.scrollTo(0, 0);
    cy.reload();
    cy.get(COMBOS_IN_DECK).should('contain', '1 Combo Found');
    cy.window().its('scrollY').should('equal', 0);
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
