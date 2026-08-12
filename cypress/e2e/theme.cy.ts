const themeButton = () => cy.get('button[title^="Switch to"]');

describe('Theme Selector', () => {
  beforeEach(() => {
    cy.clearCookie('theme');
  });

  it('defaults to the system theme when no cookie is set', () => {
    cy.visit('/about/');

    themeButton().should('have.attr', 'title', 'Switch to light theme');
  });

  it('cycles the theme and persists it to a cookie', () => {
    cy.visit('/about/');

    themeButton().click();
    cy.getCookie('theme').should('have.property', 'value', 'light');
    cy.get('html').should('not.have.class', 'dark');

    themeButton().click();
    cy.getCookie('theme').should('have.property', 'value', 'dark');
    cy.get('html').should('have.class', 'dark');

    themeButton().click();
    cy.getCookie('theme').should('have.property', 'value', 'system');
  });

  it('applies a saved dark theme before paint on a statically rendered page', () => {
    cy.setCookie('theme', 'dark', { path: '/' });
    // The inline script in _document is the only thing that can do this: /about/ is
    // prerendered at build time, so the server cannot know the cookie.
    cy.visit('/about/', {
      onBeforeLoad: (win) => {
        win.document.addEventListener('DOMContentLoaded', () => {
          expect(win.document.documentElement.classList.contains('dark')).to.equal(true);
        });
      },
    });

    cy.get('html').should('have.class', 'dark');
    themeButton().should('have.attr', 'title', 'Switch to system theme');
  });

  it('keeps the theme across a navigation to a server-rendered page', () => {
    cy.setCookie('theme', 'dark', { path: '/' });

    cy.visit('/about/');
    cy.get('html').should('have.class', 'dark');

    cy.visit('/search/?q=monolith');
    cy.get('html').should('have.class', 'dark');
  });
});
