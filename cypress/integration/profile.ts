describe("Profile", () => {
  it("requires authentication", () => {
    cy.visit("/profile/");

    cy.url().should("not.include", "/profile/");

    cy.login("basic-user");

    cy.visit("/profile/");

    cy.url().should("include", "/profile/");

    cy.logout();
  });
});
