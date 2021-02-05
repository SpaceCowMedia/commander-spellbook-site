describe("Combo Detail Page", () => {
  it("includes combo data", () => {
    cy.visit("/combo/450");

    cy.get("#combo-cards ol li").should((items) => {
      expect(items).to.have.length(2);
      expect(items[0]).to.contain("Basalt Monolith");
      expect(items[1]).to.contain("Mesmeric Orb");
    });

    cy.get("#combo-prerequisites ol li").should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get("#combo-steps ol li").should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get("#combo-results ol li").should((items) => {
      expect(items.length).to.be.greaterThan(0);
    });

    cy.get("#combo-color-identity img").should((img) => {
      expect(img.first().attr("src")).contains("C.svg");
    });
  });

  it.only("can copy page url to clipboard", () => {
    cy.visit("/combo/450");

    cy.get("#copy-combo-button").click();

    cy.window().then((win) => {
      const ta = win.document.createElement("textarea");
      ta.id = "paste-helper";
      win.document.body.appendChild(ta);
      win.navigator.clipboard
        .readText()
        .then((text) => {
          ta.value = text;
        })
        .catch((err) => {
          ta.value = err.message;
        });
    });

    // TODO this will change when underlying api module is updated to get the real id
    cy.get("#paste-helper").should(
      "have.value",
      "https://commanderspellbook.com/?id=450"
    );
  });
});
