import "./firebase-commands";

beforeEach(() => {
  cy.visit("/");

  // deny the cookies so we don't run google analytics tracking
  // during integration tests
  cy.clearLocalStorage().then((ls) => {
    ls.setItem("GDPR:accepted", "false");
  });
});
