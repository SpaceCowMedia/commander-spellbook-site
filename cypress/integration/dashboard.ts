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

    cy.get("#complete-account-setup").should("have.length", 1);
    cy.get("nav").should("not.exist");

    cy.login("basic-user");

    cy.visit("/dashboard/");

    cy.get("#complete-account-setup").should("not.exist");
    cy.get("nav").should("have.length", 1);
  });
});
