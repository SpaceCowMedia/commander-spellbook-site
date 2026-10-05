const buttons = [
  ['Advanced Search', '/advanced-search/'],
  ['Syntax', '/syntax-guide/'],
  ['Random', '/combo/'],
  ['Find My Combos', '/find-my-combos/'],
];

const SUGGESTIONS_SHOWN_KEY = 'commander-spellbook-suggestions-shown';
const SALT_VOTING_SESSIONS_KEY = 'commander-spellbook-salt-voting-sessions';

interface HomeVisit {
  random: number;
  saltVotingSessions?: { visited?: number; voted?: number };
  suggestionsShown?: number;
}

const visitHome = ({ random, saltVotingSessions, suggestionsShown }: HomeVisit) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      if (saltVotingSessions) {
        win.localStorage.setItem(SALT_VOTING_SESSIONS_KEY, JSON.stringify(saltVotingSessions));
      }
      if (suggestionsShown) {
        win.sessionStorage.setItem(SUGGESTIONS_SHOWN_KEY, `${suggestionsShown}`);
      }
      cy.stub(win.Math, 'random').returns(random);
      cy.spy(win.Storage.prototype, 'getItem').withArgs(SUGGESTIONS_SHOWN_KEY).as('suggestionRoll');
    },
  });
};

const expectSuggestionsShown = (count: number) => {
  cy.window()
    .its('sessionStorage')
    .invoke('getItem', SUGGESTIONS_SHOWN_KEY)
    .should('equal', count ? `${count}` : null);
};

const expectSaltVotingSuggestion = (shownBefore = 0) => {
  cy.get('#suggestion-balloon')
    .should('be.visible')
    .and('have.attr', 'data-suggestion', 'salt-voting')
    .find('a')
    .should('have.attr', 'href', '/salt/');
  expectSuggestionsShown(shownBefore + 1);
};

// Only the roll reads the shown count, and a shown suggestion is counted in the same effect.
const expectNoSuggestion = (shownBefore = 0) => {
  cy.get('@suggestionRoll').should('have.been.called');
  expectSuggestionsShown(shownBefore);
  cy.get('#suggestion-balloon').should('not.exist');
};

describe('Home Page', () => {
  it('searches from the search bar', () => {
    cy.visit('/');

    cy.get('input[name=q]').type('monolith result:infinite{enter}');

    cy.url().should('include', `/search/?q=${encodeURIComponent('monolith result:infinite')}`);
  });

  buttons.forEach(([label, destination]) => {
    it(`opens ${destination} with the ${label} button`, () => {
      cy.visit('/');

      cy.contains('.home-button', label).click();

      cy.url().should('include', destination);
    });
  });

  it('opens the submissions of a logged in user from the user menu', () => {
    cy.login();
    cy.visit('/');

    cy.env(['username']).then(({ username }) => {
      cy.get('#user-dropdown').should('contain', username).focus();
    });
    cy.contains('button', 'My Submissions').click();

    cy.url().should('include', '/my-submissions');
  });

  it('opens salt voting from the user menu', () => {
    cy.login();
    cy.visit('/');

    cy.get('#user-dropdown').focus();
    cy.contains('button', 'Salt Voting').click();

    cy.url().should('include', '/salt/');
  });

  describe('salt voting suggestion', () => {
    it('always invites first-time visitors, and can be dismissed', () => {
      visitHome({ random: 0.99 });

      expectSaltVotingSuggestion();
      cy.get('#suggestion-balloon-dismiss').click();
      cy.get('#suggestion-balloon').should('not.exist');
    });

    it('invites visitors who already browsed salt voting half of the time', () => {
      visitHome({ random: 0.49, saltVotingSessions: { visited: 1 } });
      expectSaltVotingSuggestion();

      cy.clearAllSessionStorage();
      visitHome({ random: 0.51, saltVotingSessions: { visited: 1 } });
      expectNoSuggestion();
    });

    it('halves the chance for every suggestion already shown in the session', () => {
      visitHome({ random: 0.49, suggestionsShown: 1 });
      expectSaltVotingSuggestion(1);

      visitHome({ random: 0.26 });
      expectNoSuggestion(2);
    });

    describe('when logged in', () => {
      beforeEach(() => {
        cy.login();
      });

      it('always invites users who never voted, even after browsing salt voting', () => {
        visitHome({ random: 0.99, saltVotingSessions: { visited: 3 } });

        expectSaltVotingSuggestion();
      });

      it('invites users who voted once half of the time', () => {
        visitHome({ random: 0.49, saltVotingSessions: { visited: 1, voted: 1 } });
        expectSaltVotingSuggestion();

        cy.clearAllSessionStorage();
        visitHome({ random: 0.51, saltVotingSessions: { visited: 1, voted: 1 } });
        expectNoSuggestion();
      });

      it('invites users who voted at least twice 30% of the time', () => {
        visitHome({ random: 0.29, saltVotingSessions: { visited: 2, voted: 2 } });
        expectSaltVotingSuggestion();

        cy.clearAllSessionStorage();
        visitHome({ random: 0.31, saltVotingSessions: { visited: 2, voted: 2 } });
        expectNoSuggestion();
      });
    });
  });

  it('signs a logged in user out', () => {
    cy.login();
    cy.visit('/');

    cy.get('#user-dropdown').focus();
    cy.contains('button', 'Sign out').click();

    cy.get('#user-dropdown').should('not.exist');
  });
});

export {};
