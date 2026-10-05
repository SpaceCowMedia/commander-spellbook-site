describe('Combo Detail Page', () => {
  beforeEach(() => {
    cy.visit('/combo/1-2/');
  });

  it('shows the combo details', () => {
    cy.get('#combo-cards ol li').should((items) => {
      expect(items).to.have.length(2);
      expect(items[0]).to.contain('Basalt Monolith');
      expect(items[1]).to.contain('Mesmeric Orb');
    });

    cy.get('#combo-prerequisites ol li').should('not.be.empty');
    cy.get('#combo-steps ol li').should('not.be.empty');
    cy.get('#combo-results ol li').should('not.be.empty');
    cy.get('#combo-color-identity img').first().should('have.attr', 'src').and('include', 'C.svg');
  });

  it('links to the combo on the card vendors', () => {
    cy.get('#tcg-buy-this-combo')
      .should('have.attr', 'href')
      .and('include', encodeURIComponent('store.tcgplayer.com/massentry'));

    cy.get('#ck-buy-this-combo').should('have.attr', 'href').and('include', 'https://www.cardkingdom.com/builder');
  });

  it('provides a preview image', () => {
    cy.get('meta[property="og:image"]')
      .should('have.attr', 'content')
      .then((src) => cy.request(`${src}`).its('status').should('eq', 200));
  });
});

describe('Combo Metadata', () => {
  it('shows how popular and how salty a combo is', () => {
    cy.visit('/combo/1-2/');

    cy.get('#combo-popularity').should('contain', 'No EDHREC data yet');
    cy.get('#combo-variant-count').should('contain', 'the only variant of this combo');
    cy.get('#combo-salt').should('contain', '2.60').and('contain', 'Very salty');
    cy.get('#combo-salt-votes').should('contain', '5 votes in the last year');
  });

  it('says so when a combo has too few salt votes', () => {
    cy.visit('/combo/1-3/');

    cy.get('#combo-salt').should('contain', 'Too few votes');
  });

  it('asks anonymous users to log in to vote', () => {
    cy.visit('/combo/1-3/');

    cy.get('#salt-vote-login').should('have.attr', 'href', '/login/?final=/combo/1-3/');
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login();
      // A vote left behind by a previous attempt would turn the first vote into a change.
      cy.deleteSaltVote('1-3');
    });

    it('casts, changes, refreshes and retracts a salt vote', () => {
      cy.intercept('PUT', '**/salt-votes/1-3/').as('vote');
      cy.intercept('DELETE', '**/salt-votes/1-3/').as('retract');
      cy.visit('/combo/1-3/');

      cy.get('#salt-vote-submit').should('be.disabled');
      cy.get('[data-salt-tick="3"]').should('not.be.disabled').click();
      cy.get('#salt-vote-slider').should('have.attr', 'aria-valuetext', '3, Very salty');
      cy.get('#salt-vote-submit').should('have.text', 'Vote').click();
      cy.wait('@vote').its('response.statusCode').should('eq', 201);
      cy.get('#salt-vote-status').should('contain', 'You voted 3 · Very salty');
      // A single vote updates the vote count right away, but is not enough for a score.
      cy.get('#combo-salt').should('contain', 'Too few votes');
      cy.get('#combo-salt-votes').should('contain', '1 vote in the last year');

      cy.get('[data-salt-tick="1"]').click();
      cy.get('#salt-vote-submit').should('have.text', 'Change vote').click();
      cy.wait('@vote').its('response.statusCode').should('eq', 200);
      cy.get('#salt-vote-status').should('contain', 'You voted 1 · Slightly salty');

      cy.reload();
      cy.get('#salt-vote-slider').should('have.value', '1');
      cy.get('#salt-vote-submit').should('have.text', 'Vote again').click();
      cy.wait('@vote').its('response.statusCode').should('eq', 200);

      cy.get('#salt-vote-retract').click();
      cy.wait('@retract').its('response.statusCode').should('eq', 204);
      cy.get('#salt-vote-status').should('not.exist');
      cy.get('#salt-vote-slider').should('have.attr', 'aria-valuetext', 'Not rated');
    });

    it('asks to vote again once a vote is more than a year old', () => {
      const oldVote = {
        variant: '1-3',
        score: 2,
        created: '2024-05-01T12:00:00Z',
        updated: '2024-05-01T12:00:00Z',
        average: null,
        voteCount: 0,
      };
      cy.intercept(
        { method: 'GET', pathname: '/salt-votes/', query: { variant: '1-3' } },
        { count: 1, next: null, previous: null, results: [oldVote] },
      );
      cy.intercept('PUT', '**/salt-votes/1-3/').as('vote');
      cy.visit('/combo/1-3/');

      cy.get('#salt-vote-status')
        .should('contain', 'You voted 2 · Moderately salty on May 1, 2024')
        .and('contain', 'your vote no longer counts');
      cy.get('#salt-vote-submit').should('have.text', 'Vote again').click();
      cy.wait('@vote').its('response.statusCode').should('eq', 201);

      cy.get('#salt-vote-status')
        .should('contain', 'You voted 2 · Moderately salty')
        .and('not.contain', 'no longer counts');
    });

    it('explains why a vote could not be cast', () => {
      cy.intercept('PUT', '**/salt-votes/1-3/', {
        statusCode: 403,
        body: { detail: 'You do not have permission to perform this action.' },
      }).as('vote');
      cy.visit('/combo/1-3/');

      cy.get('[data-salt-tick="2"]').should('not.be.disabled').click();
      cy.get('#salt-vote-submit').click();
      cy.wait('@vote');

      cy.get('#salt-vote-error').should('contain', 'not allowed to vote on salt');
    });
  });
});

describe('Combo Bracket', () => {
  const ESTIMATE = { method: 'POST', pathname: '/estimate-bracket' };

  it('shows the bracket tag, the brackets it fits and why', () => {
    cy.visit('/combo/1-2/');

    cy.get('#combo-metadata #combo-bracket-name').should('have.text', 'Spicy');
    cy.get('#combo-bracket').should('contain', 'Bracket 3-4+').and('contain', 'Probably 3 or 4, but hard to classify');
    cy.get('#combo-bracket-scale [data-bracket]').should((bars) => {
      expect(bars.toArray().map((bar) => bar.dataset.fit)).to.deep.equal([
        'excluded',
        'excluded',
        'borderline',
        'fits',
        'fits',
      ]);
    });
    cy.get('#combo-bracket-factors li').should('have.length', 1).and('contain', 'This fast, game-winning combo');
    cy.get('#combo-bracket-raised').should('not.exist');
  });

  it('names the cards and the other combos that raise the estimate', () => {
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/variants/1-3/`).then(({ body: otherCombo }) => {
        // The seeded cards hold no game changer and make no other combo, so the estimate is given both.
        cy.intercept(ESTIMATE, (request) =>
          request.continue((response) => {
            const [combo] = response.body.combos;
            response.body.bracketTag = 'R';
            response.body.cards[0].gameChanger = true;
            response.body.combos.push({ ...combo, combo: otherCombo, definitelyTwoCard: true });
          }),
        ).as('estimate');
      });
    });
    cy.visit('/combo/1-2/');
    cy.wait('@estimate');

    cy.get('#combo-bracket-raised').should('contain', '1 other combo').and('contain', 'Ruthless (Bracket 4+)');
    cy.get('#combo-bracket-factors li')
      .first()
      .should('contain', 'game changer cards pushes this card list into bracket 3+')
      .and('contain', 'Basalt Monolith');
    cy.get('#combo-bracket-other-combos').should('contain', 'Forsaken Monument').and('contain', 'Infinite mana');
  });

  it('says so when the estimate cannot be loaded', () => {
    cy.intercept(ESTIMATE, { statusCode: 500, body: {} }).as('estimate');
    cy.visit('/combo/1-2/');
    cy.wait('@estimate');

    cy.get('#combo-bracket').should('contain', 'The estimate could not be loaded.');
    cy.get('#combo-bracket-name').should('have.text', 'Spicy');
  });
});

export {};
