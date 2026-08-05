describe('Combo Detail Page', () => {
  beforeEach(() => {
    cy.visit('/combo/1-2/');
  });

  it('shows the combo details', () => {
    cy.get('#combo-cards ol li').should((items) => {
      expect(items).to.have.length(2);
      expect(items[0]).to.contain('Basalt Monolith');
      expect(items[1]).to.contain('Mesmeric Orb');
    });

    cy.get('#combo-prerequisites ol li').should('not.be.empty');
    cy.get('#combo-steps ol li').should('not.be.empty');
    cy.get('#combo-results ol li').should('not.be.empty');
    cy.get('#combo-color-identity img').first().should('have.attr', 'src').and('include', 'C.svg');
  });

  it('links to the combo on the card vendors', () => {
    cy.get('#tcg-buy-this-combo')
      .should('have.attr', 'href')
      .and('include', encodeURIComponent('store.tcgplayer.com/massentry'));

    cy.get('#ck-buy-this-combo').should('have.attr', 'href').and('include', 'https://www.cardkingdom.com/builder');
  });

  it('provides a preview image', () => {
    cy.get('meta[property="og:image"]')
      .should('have.attr', 'content')
      .then((src) => cy.request(`${src}`).its('status').should('eq', 200));
  });
});

export {};
