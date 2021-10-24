describe("Dashboard", () => {
  it("requires authentication", () => {
    cy.visit("/dashboard/");

    cy.url().should("not.include", "/dashboard/");

    cy.login("basic-user");

    cy.visit("/dashboard/");

    cy.url().should("include", "/dashboard/");

    cy.logout();
  });
});
