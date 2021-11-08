describe("Login", () => {
  it("sends an email link", () => {
    cy.visit("/login/");

    cy.get("#email").type("arjun@example.com");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/email-link-sent/");

    cy.get("#link-sent-text").should(
      "contain.text",
      "Check your email on this device for a sign in link."
    );
  });

  it("requires email", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("The email address is badly formatted.");
      return false;
    });

    cy.visit("/login/");

    cy.get("button[type='submit']").click();

    cy.get("#email-error").should("contain.text", "Email cannot be empty.");

    cy.get("#email").type("arjun");

    cy.get("button[type='submit']").click();

    cy.get("#email-error").should(
      "contain.text",
      "The email address is badly formatted."
    );
  });
});
