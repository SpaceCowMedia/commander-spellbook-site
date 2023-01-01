describe("Site Settings", () => {
  afterEach(() => {
    cy.logout();
  });

  // TODO eventually, this test will be changed to prevent the user even visting the page
  it("requires site content management permission", () => {
    cy.login("basic-user");

    cy.visit("/dashboard/site-settings/");

    cy.get("#submit-featured-updates").click();

    cy.get("#featured-error").should("exist");
  });

  it("can change the featured rules", () => {
    cy.login("site-settings-manager");

    cy.visit("/dashboard/site-settings/");

    cy.get("#featured-button-text").clear();
    cy.get("#featured-button-text").type("New Featured");

    cy.get("#featured-set-code-0").clear();
    cy.get("#featured-set-code-0").type("dom");

    cy.get("#featured-set-code-0").type("dom");

    cy.get("#add-set-code-rule-button-0").click();
    cy.get("#featured-set-code-1").type("cmr");

    cy.get("#submit-featured-updates").click();

    cy.get("#featured-info").should("exist");
  });
});
