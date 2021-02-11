beforeAll(() => {
  cy.visit("/");

  // TODO remove this when the beta mask component is removed
  cy.get("input#beta-password").type("arjun{enter}");
  // deny the cookies so we don't run google analytics tracking
  // during integration tests
  cy.get("#cookie-deny-button").click();
});
