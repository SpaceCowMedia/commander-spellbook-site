declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with the username and password of the test account, the way the login page does once
       * Discord has authenticated the user.
       */
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  const username = Cypress.env('username');

  cy.request('POST', `${Cypress.env('apiUrl')}/token/`, {
    username,
    password: Cypress.env('password'),
  }).then(({ body }) => {
    const { user_id: userId } = JSON.parse(atob(body.access.split('.')[1]));

    cy.setCookie('csbJwt', body.access);
    cy.setCookie('csbRefresh', body.refresh);
    cy.setCookie('csbUsername', username);
    cy.setCookie('csbUserId', `${userId}`);
  });
});

export {};
