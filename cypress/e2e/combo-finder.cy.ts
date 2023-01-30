describe("Combo Finder Page", () => {
  it("can lookup combos in deck", () => {
    cy.visit("/combo-finder/");

    cy.get("#decklist-input").type(`Exquisite Blood
Sanguine Bond`);

    cy.get("#potential-combos-in-deck-section h2", { timeout: 10000 }).should(
      "be.visible"
    );

    cy.get("#combos-in-deck-section h2").should("have.text", "1 Combo Found");
  });
});
