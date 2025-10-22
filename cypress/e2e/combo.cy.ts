describe('Combo Detail Page', () => {
  it('includes combo data', () => {
    cy.visit('/combo/450/');

    cy.get('#combo-cards ol li').should((items) => {
      expect(items).to.have.length(2);
      expect(items[0]).to.contain('Basalt Monolith');
      expect(items[1]).to.contain('Mesmeric Orb');
    });

    cy.get('#combo-prerequisites ol li').should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get('#combo-steps ol li').should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get('#combo-results ol li').should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get('#combo-color-identity img').should((img) => {
      expect(img.first().attr('src')).contains('C.svg');
    });
  });

  it('can buy combo on TCGplayer', () => {
    cy.visit('/combo/3616/');

    cy.get('#tcg-buy-this-combo')
      .should('have.attr', 'href')
      .and('include', encodeURIComponent('store.tcgplayer.com/massentry'));
  });

  it('can buy combo on Card Kingdom', () => {
    cy.visit('/combo/3616/');

    cy.get('#ck-buy-this-combo').should('have.attr', 'href').and('include', 'https://www.cardkingdom.com/builder');
  });

  it('provides combo preview', () => {
    cy.visit('/combo/450/');

    cy.get('meta[property="og:image"]').each(($img) => {
      const src = $img.attr('content');
      cy.wrap(src).should('not.be', undefined);
      cy.request(src!).its('status').should('eq', 200);
    });
  });
});

export {};
