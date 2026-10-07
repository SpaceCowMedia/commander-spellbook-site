import { stubScryfallPagedSearch } from '../support/scryfall';
import { expectTransitionType, spyOnViewTransitions } from '../support/viewTransitions';

const wheelCard = () => cy.get('img[alt^="Template replacement: "]');
const turnWheel = (direction: 'left' | 'right') => cy.get(`svg[data-icon="chevron-${direction}"]`).first().click();

// The replacements of a template query drafted in the submission form come from a Scryfall search, stubbed here with
// pages of two of the three seeded cards.
describe('Template card', () => {
  beforeEach(() => {
    stubScryfallPagedSearch(2);
    cy.login();
    cy.visit('/submit-a-combo/');
    cy.contains('button', 'Add Template').click();
    cy.get('input[placeholder="(ex: t:creature)"]').type('t:artifact');
    wheelCard().should('have.attr', 'alt', 'Template replacement: Basalt Monolith');
    spyOnViewTransitions();
  });

  it('turns its wheel of replacements across their pages', () => {
    turnWheel('right');
    wheelCard().should('have.attr', 'alt', 'Template replacement: Mesmeric Orb');
    expectTransitionType('wheel-next');

    turnWheel('right');
    wheelCard().should('have.attr', 'alt', 'Template replacement: Forsaken Monument');
    expectTransitionType('wheel-next');

    turnWheel('right');
    wheelCard().should('have.attr', 'alt', 'Template replacement: Basalt Monolith');
    expectTransitionType('wheel-next');

    turnWheel('left');
    wheelCard().should('have.attr', 'alt', 'Template replacement: Forsaken Monument');
    expectTransitionType('wheel-previous');
  });

  it('grows its card into the replacement list and back', () => {
    cy.contains('button', /View \d+ Cards/).click();
    cy.get('dialog[open]').should('contain', 'Replacement list');
    expectTransitionType('template-morph');

    cy.get('dialog[open] svg[data-icon="xmark"]').click();
    cy.get('dialog').should('not.exist');
    expectTransitionType('template-morph');
    wheelCard().should('be.visible');
  });

  it('loads more replacements into its list', () => {
    cy.contains('button', /View \d+ Cards/).click();
    cy.get('dialog[open] .replacementCard').should('have.length', 2);
    expectTransitionType('template-morph');

    cy.contains('dialog[open] button', 'Load More').click();
    cy.get('dialog[open] .replacementCard').should('have.length', 3);
    cy.get('dialog[open] img[alt="Forsaken Monument"]').should('be.visible');
    expectTransitionType('load-more');
  });

  it('closes the replacement list when clicking outside of it', () => {
    cy.contains('button', /View \d+ Cards/).click();
    cy.get('dialog[open]').should('be.visible');

    cy.get('body').click(5, 5);
    cy.get('dialog').should('not.exist');
  });
});

export {};
