describe('Search Bar', () => {
  it('is present on many pages', () => {
    const pages = ['advanced-search', 'combo/1-2', 'search', 'syntax-guide'];

    pages.forEach((page) => {
      cy.visit(`/${page}/`);
      cy.get('input[name=q]').should('have.length', 1);
    });
  });

  it('can enter a query', () => {
    cy.visit('/syntax-guide/');

    cy.get('input[name=q]').type('mesmeric result:infinite{enter}');

    cy.url().should('include', `/search/?q=${encodeURIComponent('mesmeric result:infinite')}`);
  });

  it('does not search when query is empty', () => {
    cy.visit('/advanced-search/');

    cy.get('input[name=q]').type('      {enter}');

    cy.url().should('include', '/advanced-search');
  });
});

export {};
