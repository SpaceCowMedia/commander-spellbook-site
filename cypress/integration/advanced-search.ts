describe("Advanced Search Page", () => {
  it("can search card names in combo", () => {
    cy.visit("/advanced-search");

    cy.get("#card-name-inputs input.input").should("have.length", 1);
    cy.get("#card-name-inputs input.input-0").type("mesmeric");

    cy.get("#card-name-inputs button").click();
    cy.get("#card-name-inputs input.input").should("have.length", 2);

    cy.get("#card-name-inputs input.input-1").type("basalt");

    cy.get("#advanced-search-submit-button").click();

    cy.url().should(
      "include",
      "/search?q=card%3A%22mesmeric%22%20card%3A%22basalt%22"
    );
  });

  it("can search color identity in combo", () => {
    cy.visit("/advanced-search");

    cy.get("#color-identity-chooser .ci-button-0").click();
    cy.get("#color-identity-chooser .ci-button-1").click();
    cy.get("#color-identity-chooser .ci-button-4").click();

    cy.get("#advanced-search-submit-button").click();

    cy.url().should("include", "/search?q=ci%3Abr");
  });

  it("can search prerequisites in combo", () => {
    cy.visit("/advanced-search");

    cy.get("#prerequisite-inputs input.input").should("have.length", 1);
    cy.get("#prerequisite-inputs input.input-0").type("mana");

    cy.get("#prerequisite-inputs button").click();
    cy.get("#prerequisite-inputs input.input").should("have.length", 2);

    cy.get("#prerequisite-inputs input.input-1").type("untap");

    cy.get("#advanced-search-submit-button").click();

    cy.url().should(
      "include",
      "/search?q=pre%3A%22mana%22%20pre%3A%22untap%22"
    );
  });

  it("can search steps in combo", () => {
    cy.visit("/advanced-search");

    cy.get("#step-inputs input.input").should("have.length", 1);
    cy.get("#step-inputs input.input-0").type("mana");

    cy.get("#step-inputs button").click();
    cy.get("#step-inputs input.input").should("have.length", 2);

    cy.get("#step-inputs input.input-1").type("untap");

    cy.get("#advanced-search-submit-button").click();

    cy.url().should(
      "include",
      "/search?q=step%3A%22mana%22%20step%3A%22untap%22"
    );
  });

  it("can search results in combo", () => {
    cy.visit("/advanced-search");

    cy.get("#result-inputs input.input").should("have.length", 1);
    cy.get("#result-inputs input.input-0").type("mana");

    cy.get("#result-inputs button").click();
    cy.get("#result-inputs input.input").should("have.length", 2);

    cy.get("#result-inputs input.input-1").type("untap");

    cy.get("#advanced-search-submit-button").click();

    cy.url().should(
      "include",
      "/search?q=result%3A%22mana%22%20result%3A%22untap%22"
    );
  });
});
