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

  it('clears the search bar when asking for a random combo', () => {
    cy.visit('/search/?q=monolith');
    cy.get('input[name=q]').should('have.value', 'monolith');

    cy.contains('nav a', 'Random').click();

    cy.url().should('include', '/combo/');
    cy.get('input[name=q]').should('have.value', '');
    cy.url().should('not.include', 'q=');
  });
});

export {};
