describe("Dashboard", () => {
  afterEach(() => {
    cy.logout();
  });

  it("requires authentication", () => {
    cy.visit("/dashboard/");

    cy.url().should("not.include", "/dashboard/");

    cy.login("basic-user");

    cy.visit("/dashboard/");

    cy.url().should("include", "/dashboard/");
  });

  it("requires user to be provisioned", () => {
    cy.login("unprovisioned-user");

    cy.visit("/dashboard/");

    cy.get("#complete-account-setup").should("exist");
    cy.get("nav").should("not.exist");

    cy.logout();

    cy.login("basic-user");

    // shows that the dashboard link can be found in the navbar
    // on the normal site
    cy.visit("/advanced-search/");
    cy.get("[href='/dashboard/']").click();

    cy.get("#complete-account-setup").should("not.exist");
    cy.get("nav").should("exist");
  });
});
