import { stubScryfallSearch } from '../support/scryfall';

const SPOILER = 'Basalt Monolith';
const VEIL = '[aria-label="Reveal this spoiler card"]';

const spoilersShownForSession = () =>
  cy.window().its('sessionStorage').invoke('getItem', 'commander-spellbook-show-spoilers');

// The test database holds no unreleased card, so one comes from the Scryfall search previewing a
// template query drafted in the submission form. Stubbed card images are a single pixel, and the
// replacement list is a fixed modal where Cypress judges a veil by its center, right under the
// label: clicks are forced rather than trusting either to look visible.
describe('Spoiler fog', () => {
  beforeEach(() => {
    stubScryfallSearch([SPOILER]);
    cy.login();
    cy.visit('/submit-a-combo/');
    cy.contains('button', 'Add Template').click();
    cy.get('input[placeholder="(ex: t:creature)"]').type('t:artifact');
    cy.get(VEIL).should('have.length', 1);
  });

  it('fogs an unreleased replacement until it is clicked', () => {
    cy.contains('button', /View \d+ Cards/).click();
    cy.get(`img[alt="${SPOILER}"]`).should('exist');
    // only the unreleased one of the three replacements in the list
    cy.get(VEIL).should('have.length', 2);

    cy.get(VEIL).last().click(20, 20, { force: true });
    // the same card clears everywhere it is shown, and no other spoiler is revealed
    cy.get(VEIL).should('not.be.visible');
    spoilersShownForSession().should('equal', null);
  });

  it('shows every spoiler until the tab is closed once the label is clicked', () => {
    cy.contains('button', 'Spoiler')
      .should('have.attr', 'data-tooltip-content', 'Click to show every spoiler until you close this tab')
      .click({ force: true });
    spoilersShownForSession().should('equal', 'true');
    cy.get(VEIL).should('not.be.visible');

    // a fog drawn afterwards starts out dissolved
    cy.contains('button', /View \d+ Cards/).click();
    cy.get(VEIL).should('have.length', 2).and('not.be.visible');
  });
});

export {};
