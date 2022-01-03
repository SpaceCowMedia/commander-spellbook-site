describe("Sign Up", () => {
  it("sends an email link", () => {
    cy.visit("/sign-up/");

    cy.get("#email").type("arjun@example.com");
    cy.get("#display-name").type("Arjun, the Shifting Flame");
    cy.get("button[type='submit']").click();

    cy.get("#link-sent-text").should(
      "have.text",
      "Check your email to complete the setup process."
    );
  });

  it("requires email and display name", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("The email address is badly formatted.");
      return false;
    });

    cy.visit("/sign-up/");

    cy.get("button[type='submit']").click();

    cy.get("#email-error").should("contain.text", "Email cannot be empty.");
    cy.get("#display-name-error").should(
      "contain.text",
      "Display name cannot be empty."
    );

    // TODO the emulators no longer validate the format of the email
    // cy.get("#display-name").type("Arjun, the Shifting Flame");
    // cy.get("#email").type("arjun");
    //
    // cy.get("button[type='submit']").click();
    //
    // cy.get("#email-error").should(
    //   "contain.text",
    //   "The email address is badly formatted."
    // );
  });
});
