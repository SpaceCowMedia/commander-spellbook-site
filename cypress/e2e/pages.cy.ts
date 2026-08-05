const pages = [
  ['/about/', 'About Commander Spellbook'],
  ['/syntax-guide/', 'Syntax Guide'],
  ['/metrics/', 'Metrics'],
  ['/style-guide/', 'Style Guide'],
  ['/privacy-policy/', 'Privacy Policy'],
  ['/combo-of-the-day/', 'Combo of the Day'],
  ['/login/', 'Login'],
];

describe('Informational Pages', () => {
  pages.forEach(([path, heading]) => {
    it(`serves ${path}`, () => {
      cy.visit(path);

      cy.get('h1').should('contain', heading);
      cy.get('footer').should('be.visible');
    });
  });

  it('counts the combos of the database on the metrics page', () => {
    cy.visit('/metrics/');

    cy.contains('tr', 'Number of Variants').should('contain', '2');
  });

  it('redirects to a combo from the random page', () => {
    cy.visit('/random/');

    cy.url().should('include', '/combo/');
    cy.get('#combo-cards').should('contain', 'Basalt Monolith');
  });
});

export {};
