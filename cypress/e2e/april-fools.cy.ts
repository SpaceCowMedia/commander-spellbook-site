const FRONT_OF_CARD = 'img[alt="the front side of Basalt Monolith"]';
const EDIBLE_CARD = '[class*="__edible"]';
const FOOTER_WAVES = 'img[alt="footer"]';
const APRIL_FOOLS_DAY = new Date(2027, 3, 1, 12);
const ANY_OTHER_DAY = new Date(2027, 3, 2, 12);

function visitOn(day: Date, url: string) {
  cy.clock(day, ['Date']);
  cy.visit(url);
}

function leaveWithMouse() {
  cy.get(FRONT_OF_CARD).then(($front) => {
    cy.wrap($front).trigger('pointerout', {
      eventConstructor: 'PointerEvent',
      pointerType: 'mouse',
      relatedTarget: $front[0].ownerDocument.body,
    });
  });
}

describe("April Fools' Day", () => {
  it('stays out of the way on any other day', () => {
    visitOn(ANY_OTHER_DAY, '/combo/1-2/');

    cy.get('#combo-steps ol li').should('have.length', 1);
    cy.get('#combo-results ol li').should('have.length', 1);
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('not.exist');
    cy.get(FOOTER_WAVES).should('have.attr', 'src').and('contain', '/footer.svg');
  });

  it('straightens the footer waves into pyramids', () => {
    visitOn(APRIL_FOOLS_DAY, '/');

    cy.get(FOOTER_WAVES).should('have.attr', 'src').and('contain', '/pointy-footer.svg');
  });

  it('pads the combo with one more step and one more result', () => {
    visitOn(APRIL_FOOLS_DAY, '/combo/1-2/');

    cy.get('#combo-steps ol li')
      .should('have.length', 2)
      .last()
      .should('contain', 'Explain the combo to the table for 1 minute while everyone reads every card.');
    cy.get('#combo-results ol li').should('have.length', 2).last().should('contain', 'Infinite table salt.');
  });

  it('prices the combo in Sol Rings', () => {
    const solRing = {
      name: 'Sol Ring',
      features: [],
      prices: { tcgplayer: '1.87', cardkingdom: '2.00', cardmarket: '1.00' },
    };
    cy.intercept(
      { pathname: '/cards/', query: { q: 'Sol Ring' } },
      { body: { count: null, next: null, previous: null, results: [solRing] } },
    );
    visitOn(APRIL_FOOLS_DAY, '/combo/1-2/');

    cy.get('#tcg-buy-this-combo').should('contain', '≈ 4 Sol Rings');
    cy.get('#ck-buy-this-combo').should('not.contain', 'Sol Ring');
  });

  it('eats a card one piece per hover, then brings it back whole', () => {
    visitOn(APRIL_FOOLS_DAY, '/combo/1-2/');
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('exist');

    for (let piece = 1; piece <= 7; piece++) {
      leaveWithMouse();
      cy.get(FRONT_OF_CARD)
        .parents(EDIBLE_CARD)
        .should('have.attr', 'data-kind')
        .and('match', /^(bite|tear)$/);
      cy.get(FRONT_OF_CARD)
        .parents(EDIBLE_CARD)
        .should('have.attr', 'data-pieces', Array.from({ length: piece }, (_, i) => i + 1).join(' '));
    }
    cy.get(FRONT_OF_CARD).should(($front) => {
      expect(getComputedStyle($front[0]).maskImage).to.contain('data:image/svg+xml');
    });

    leaveWithMouse();
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('have.attr', 'data-eaten');
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('have.attr', 'data-restoring');
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('not.have.attr', 'data-kind');
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('not.have.attr', 'data-pieces');
    cy.get(FRONT_OF_CARD).should('be.visible');
  });

  it('takes a piece when a swipe leaves the card', () => {
    visitOn(APRIL_FOOLS_DAY, '/combo/1-2/');
    cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('exist');

    cy.get(FRONT_OF_CARD).scrollIntoView();
    cy.get(FRONT_OF_CARD).then(($front) => {
      const rect = $front[0].getBoundingClientRect();
      const inside = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
      const touch = (type: string, point: typeof inside) =>
        cy.wrap($front).trigger(type, { touches: [], changedTouches: [point], scrollBehavior: false });

      touch('touchstart', inside);
      touch('touchend', inside);
      cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('not.have.attr', 'data-pieces');

      touch('touchstart', inside);
      touch('touchend', { clientX: rect.right + 40, clientY: inside.clientY });
      cy.get(FRONT_OF_CARD).parents(EDIBLE_CARD).should('have.attr', 'data-pieces', '1');
    });
  });

  it('praises a deck without Sol Ring', () => {
    visitOn(APRIL_FOOLS_DAY, '/find-my-combos/');
    cy.get('#decklist-input').type('1 Basalt Monolith\n1 Mesmeric Orb');
    cy.get('#parse-decklist-input').click();

    cy.get('#sol-ring-verdict').should('contain', 'No Sol Ring?');
  });

  it('publishes the unofficial metrics', () => {
    visitOn(APRIL_FOOLS_DAY, '/metrics/');

    cy.contains('th', 'Unofficial Stat').should('exist');
    cy.contains('td', 'Salt generated').next().should('contain', 'Infinite');
  });
});

export {};
