// TODO remove this when the beta mask component is removed
beforeEach(() => {
  cy.visit("/");

  cy.get("input#beta-password").type("arjun{enter}");
});
