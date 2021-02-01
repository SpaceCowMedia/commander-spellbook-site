describe("Home Page", () => {
  // TODO remove this when the beta mask component is removed
  beforeEach(() => {
    cy.visit("/");

    cy.get("input#beta-password").type("arjun{enter}");
  });

  it("can enter a query", () => {
    cy.visit("/");

    cy.get("input[name=q]").type("mesmeric result:infinite{enter}");

    cy.url().should("include", "/search");
  });

  it("can load a random combo", () => {
    cy.visit("/");

    cy.get("a[href='/random']").click();

    cy.url().should("include", "/combo");
  });
});
