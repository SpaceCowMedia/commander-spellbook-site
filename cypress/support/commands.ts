declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with the username and password of the test account, the way the login page does once
       * Discord has authenticated the user.
       */
      login(): Chainable<void>;
      /**
       * Deletes every combo suggestion of the test account. A suggestion left behind by a failed
       * attempt makes every following one fail, because the same combo cannot be suggested twice.
       */
      deleteComboSuggestions(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.env(['apiUrl', 'username', 'password']).then(({ apiUrl, username, password }) => {
    cy.request('POST', `${apiUrl}/token/`, { username, password }).then(({ body }) => {
      const payload = body.access.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { user_id: userId } = JSON.parse(atob(payload));

      cy.setCookie('csbJwt', body.access);
      cy.setCookie('csbRefresh', body.refresh);
      cy.setCookie('csbUsername', username);
      cy.setCookie('csbUserId', `${userId}`);
    });
  });
});

Cypress.Commands.add('deleteComboSuggestions', () => {
  cy.getCookie('csbJwt').then((jwt) => {
    if (!jwt) {
      return;
    }
    const headers = { Authorization: `Bearer ${jwt.value}` };
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/variant-suggestions/?limit=100`,
        headers,
        failOnStatusCode: false,
      }).then(({ body }) => {
        for (const suggestion of body?.results ?? []) {
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/variant-suggestions/${suggestion.id}/`,
            headers,
            failOnStatusCode: false,
          });
        }
      });
    });
  });
});

export {};
