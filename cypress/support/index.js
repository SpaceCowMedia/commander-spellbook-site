beforeEach(() => {
  cy.visit("/");

  // deny the cookies so we don't run google analytics tracking
  // during integration tests
  cy.clearLocalStorage().then((ls) => {
    ls.setItem("GDPR:accepted", "false");
  });

  // TODO remove this when the beta mask component is removed
  cy.get("input#beta-password").type("arjun{enter}");
});
