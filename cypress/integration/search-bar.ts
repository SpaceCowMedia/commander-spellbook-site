describe("Search Bar", () => {
  it("is present on many pages", () => {
    const pages = ["advanced-search", "combo/450", "search", "syntax-guide"];

    pages.forEach((page) => {
      cy.visit(`/${page}`);
      cy.get(".main-search-input").should("have.length", 1);
    });
  });

  it("can enter a query", () => {
    cy.visit("/syntax-guide");

    cy.get("input[name=q]").type("mesmeric result:infinite{enter}");

    cy.url().should("include", "/search?q=mesmeric%20result%3Ainfinite");
  });

  it("does not search when query is empty", () => {
    cy.visit("/advanced-search");

    cy.get("input[name=q]").type("      {enter}");

    cy.url().should("include", "/advanced-search");
  });
});
