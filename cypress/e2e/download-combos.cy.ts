import path from 'path';

describe('Download combos button', () => {
  const downloadDir = 'cypress/downloads';

  it('Should download file if combos have been found', () => {
    // GIVEN
    const searchQuery = 'loot';
    cy.visit('/search?q=' + searchQuery);

    // WHEN
    cy.get('#download-combos-btn').click();

    // THEN
    const comboFileName = 'commander_spellbook_combos.txt';
    cy.readFile(path.join(downloadDir, comboFileName));
  });

  it('Should not appear if not combo found', () => {
    // GIVEN
    const searchQuery = 'dummy-search-impossible-to-find-something';
    cy.visit('/search?q=' + searchQuery);

    // THEN
    cy.get('#download-combos-btn').should('not.exist');
  });
});
