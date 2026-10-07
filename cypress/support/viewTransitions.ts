// Browsers without view transitions skip these checks.

export const spyOnViewTransitions = () => {
  cy.document().then((doc) => {
    if ('startViewTransition' in doc) {
      cy.spy(doc, 'startViewTransition').as('startViewTransition');
    }
  });
};

export const expectTransitionType = (type: string) => {
  cy.document().then((doc) => {
    if (!('startViewTransition' in doc)) {
      return;
    }
    cy.get<sinon.SinonSpy>('@startViewTransition').should((spy) => {
      expect(spy.args.some(([options]) => options?.types?.includes(type))).to.equal(true);
    });
    cy.get<sinon.SinonSpy>('@startViewTransition').invoke('resetHistory');
  });
};

// Going back to a page whose data it already has, Next renders it during the popstate event, where React commits the
// transition synchronously, without starting a view transition at all.
export const expectNoAnimation = () => {
  cy.document().then((doc) => {
    if (!('startViewTransition' in doc)) {
      return;
    }
    cy.get<sinon.SinonSpy>('@startViewTransition').should((spy) => {
      expect(spy.args.every(([options]) => options?.types?.includes('no-animation'))).to.equal(true);
    });
  });
};
