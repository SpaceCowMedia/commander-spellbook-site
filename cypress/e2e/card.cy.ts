describe('Card Page', () => {
  beforeEach(() => {
    cy.visit('/card/1/');
  });

  it('shows the card and its combos', () => {
    cy.get('h1').should('contain', 'Basalt Monolith');
    cy.get('#card-combos').should('contain', '2 combos');
    cy.get('#card-partners a[href="/card/2/"]').should('contain', 'Mesmeric Orb');
    cy.get('#card-partners a[href="/card/2/"] img').should('be.visible');
    cy.get('#card-partners a[href="/card/3/"]').should('contain', 'Forsaken Monument');
    cy.get('#card-combos a[href^="/combo/"]').should('have.length', 2);
  });

  it('sorts its combos without leaving the page', () => {
    cy.intercept({ method: 'GET', pathname: '/variants/', query: { ordering: /^-created,/ } }).as('variants');

    cy.get('#card-combos-sort').select('created');

    cy.wait('@variants').its('request.url').should('include', 'groupByCombo=false');
    cy.get('#card-combos a[href^="/combo/"]').should('have.length', 2);
  });

  it('links to the card references and vendors', () => {
    cy.get('#card-edhrec-link').should('have.attr', 'href', 'https://edhrec.com/cards/basalt-monolith');
    cy.get('#card-scryfall-link').should('have.attr', 'href').and('include', 'https://scryfall.com/search?q=');
    cy.get('#card-gatherer-link')
      .should('have.attr', 'href')
      .and('include', 'https://gatherer.wizards.com/search?searchTerm=Basalt');
    cy.get('#tcg-buy-this-card').should('contain', '$4.99');
    cy.get('#tcg-buy-this-card').should('have.attr', 'href').and('include', 'https://partner.tcgplayer.com/');
    // The seeded card has no Card Kingdom price
    cy.get('#ck-buy-this-card').should('contain', 'Unavailable').and('not.have.attr', 'href');
    cy.get('#card-submit-combo-button').should('have.attr', 'href', '/submit-a-combo/?card=Basalt+Monolith');
  });

  it('explains its links with titles', () => {
    cy.get('#card-gatherer-link').should('have.attr', 'title', 'Open Basalt Monolith on Gatherer, in a new tab');
    cy.get('#card-partners a[href="/card/2/"]').should('have.attr', 'title', 'Open Mesmeric Orb and its combos');
  });

  it('describes itself to search engines and social networks', () => {
    cy.get('link[rel="canonical"]')
      .should('have.attr', 'href')
      .and('match', /\/card\/1\/$/);
    cy.get('meta[name="robots"]').should('not.exist');
    cy.get('meta[property="og:url"]')
      .should('have.attr', 'content')
      .and('match', /^https?:\/\/.*\/card\/1\/$/);
    cy.get('script[type="application/ld+json"]')
      .invoke('text')
      .then((text) => JSON.parse(text))
      .its('@type')
      .should('eq', 'CollectionPage');
    cy.get('meta[property="og:image"]')
      .should('have.attr', 'content')
      .then((src) => cy.request(`${src}`).its('headers.content-type').should('eq', 'image/png'));
  });
});

describe('Card Page addresses', () => {
  it('redirects to the canonical address of a card', () => {
    cy.request({ url: '/card/6b8cf2a0-b045-4d91-9d91-c602d40c6237/', followRedirect: false }).then((response) => {
      expect(response.status).to.eq(308);
      expect(response.redirectedToUrl).to.match(/\/card\/1\/$/);
    });
    cy.request({ url: '/card/01/', followRedirect: false })
      .its('redirectedToUrl')
      .should('match', /\/card\/1\/$/);
  });

  it('answers 404 for unknown cards', () => {
    cy.request({ url: '/card/999999/', failOnStatusCode: false }).its('status').should('eq', 404);
    cy.request({ url: '/card/not-a-card/', failOnStatusCode: false }).its('status').should('eq', 404);
  });
});

export {};
