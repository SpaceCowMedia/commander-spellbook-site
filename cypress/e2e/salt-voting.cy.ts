const QUEUE = { method: 'GET', pathname: '/salt-votes/queue/' };
const VOTE = { method: 'PUT', pathname: '/salt-votes/*/' };
const SALT_VOTING_SESSIONS_KEY = 'commander-spellbook-salt-voting-sessions';

const expectSaltVotingSessions = (sessions: { visited: number; voted?: number }) => {
  cy.window()
    .its('localStorage')
    .invoke('getItem', SALT_VOTING_SESSIONS_KEY)
    .then((stored) => expect(JSON.parse(stored ?? 'null')).to.deep.equal(sessions));
};

// The seeded combos use a card that is still a spoiler, which the queue leaves out, so it is served from here.
const serveQueueOf = (...variantIds: string[]) => {
  cy.env(['apiUrl']).then(({ apiUrl }) => {
    const variants: unknown[] = [];
    for (const variantId of variantIds) {
      cy.request(`${apiUrl}/variants/${variantId}/`).then(({ body }) => variants.push(body));
    }
    cy.intercept(QUEUE, (request) => {
      expect(request.query.limit).to.equal('50');
      request.reply(variants);
    }).as('queue');
  });
};

describe('Salt Voting', () => {
  it('lets anonymous visitors browse the combos and asks them to log in to vote', () => {
    serveQueueOf('1-2', '1-3');
    cy.visit('/salt/');
    cy.wait('@queue');

    cy.get('#salt-voting-combo').should('contain', 'Basalt Monolith').and('contain', 'Mesmeric Orb');
    cy.get('#salt-voting-open-combo').should('have.attr', 'href', '/combo/1-2/');
    cy.get('#salt-voting-login').should('have.attr', 'href', '/login/?final=/salt/');
    cy.get('#salt-voting-slider').should('not.exist');

    cy.get('#salt-voting-skip').click();
    cy.get('#salt-voting-combo').should('contain', 'Forsaken Monument');
    cy.get('#salt-voting-tally').should('contain', '0 voted · 1 skipped');
    expectSaltVotingSessions({ visited: 1 });

    // Every batch brings back the same two combos, so once both are skipped there is nothing new to vote on.
    cy.get('#salt-voting-skip').click();
    cy.get('#salt-voting-caught-up').should('contain', "You're all caught up!");
  });

  it('shows where each card starts, with a tooltip on each symbol', () => {
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/variants/1-2/`).then(({ body: combo }) => {
        // Every seeded card starts on the battlefield, so the second one is given alternatives and a commander.
        Object.assign(combo.uses[1], { zoneLocations: ['H', 'E'], exileCardState: 'face down', mustBeCommander: true });
        cy.intercept(QUEUE, [combo]).as('queue');
      });
    });
    cy.visit('/salt/');
    cy.wait('@queue');

    cy.get('#salt-voting-combo [data-zone]').should((symbols) => {
      expect(symbols.toArray().map((symbol) => symbol.getAttribute('aria-label'))).to.deep.equal([
        'Starts on the battlefield',
        'Can start in hand',
        'Can start in exile (face down)',
      ]);
    });
    cy.get('#salt-voting-combo [data-zone="E"]').prev().should('have.text', 'or');
    cy.get('#salt-voting-combo [aria-label="Must be your commander"]').should('exist');

    cy.get('#salt-voting-combo [data-zone="B"]').focus();
    cy.get('[role="tooltip"]').should('be.visible').and('have.text', 'Starts on the battlefield');
  });

  it('previews a card while its image is hovered', () => {
    const image = 'https://cards.scryfall.io/normal/front/basalt-monolith.jpg';
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.request(`${apiUrl}/variants/1-2/`).then(({ body: combo }) => {
        // The seeded cards have no images, so one is given an image to preview.
        combo.uses[0].card.imageUriFrontNormal = image;
        cy.intercept(QUEUE, [combo]).as('queue');
      });
    });
    cy.visit('/salt/');
    cy.wait('@queue');

    cy.get('#salt-voting-combo img[alt="the front side of Basalt Monolith"]').trigger('mousemove', { force: true });
    cy.get('img[alt="Front Image"]').should('be.visible').and('have.attr', 'src', image);

    cy.get('#salt-voting-combo img[alt="the front side of Basalt Monolith"]').trigger('mouseout', { force: true });
    cy.get('img[alt="Front Image"]').should('not.be.visible');
  });

  it('comes back to the combo it was showing once the visitor logs in to vote', () => {
    serveQueueOf('1-2', '1-3');
    cy.visit('/salt/');
    cy.get('#salt-voting-open-combo').should('have.attr', 'href', '/combo/1-2/');
    cy.get('#salt-voting-login').click();
    cy.location('pathname').should('equal', '/login/');

    // The queue is drawn at random, so it comes back in another order after logging in.
    cy.login();
    serveQueueOf('1-3', '1-2');
    cy.visit('/salt/');
    cy.wait('@queue');

    cy.get('#salt-voting-slider').should('exist');
    cy.get('#salt-voting-open-combo').should('have.attr', 'href', '/combo/1-2/');
    cy.get('#salt-voting-skip').click();
    cy.get('#salt-voting-open-combo').should('have.attr', 'href', '/combo/1-3/');
    cy.get('#salt-voting-skip').click();
    cy.get('#salt-voting-caught-up').should('be.visible');
  });

  describe('when logged in', () => {
    beforeEach(() => {
      cy.login();
      serveQueueOf('1-2', '1-3');
    });

    it('casts votes with the slider and with the keyboard', () => {
      cy.intercept(VOTE, (request) => request.reply({ statusCode: 201, body: {} })).as('vote');
      cy.visit('/salt/');

      cy.get('#salt-voting-vote').should('be.disabled');
      cy.get('[data-salt-tick="4"]').should('not.be.disabled').click();
      cy.get('#salt-voting-slider').should('have.attr', 'aria-valuetext', '4, Extremely salty');
      cy.get('#salt-voting-vote').click();
      cy.wait('@vote').then(({ request }) => {
        expect(request.url).to.include('/salt-votes/1-2/');
        expect(request.body).to.deep.equal({ score: 4 });
      });

      cy.get('#salt-voting-combo').should('contain', 'Forsaken Monument');
      cy.get('#salt-voting-slider').should('have.attr', 'aria-valuetext', 'Not rated');
      cy.get('#salt-voting-tally').should('contain', '1 voted · 0 skipped');
      expectSaltVotingSessions({ visited: 1, voted: 1 });

      cy.get('body').trigger('keydown', { key: '2' });
      cy.get('#salt-voting-slider').should('have.attr', 'aria-valuetext', '2, Moderately salty');
      cy.get('body').trigger('keydown', { key: 'Enter' });
      cy.wait('@vote').then(({ request }) => {
        expect(request.url).to.include('/salt-votes/1-3/');
        expect(request.body).to.deep.equal({ score: 2 });
      });

      cy.get('#salt-voting-tally').should('contain', '2 voted · 0 skipped');
      cy.get('#salt-voting-caught-up').should('be.visible');
      expectSaltVotingSessions({ visited: 1, voted: 1 });
    });

    it('explains why a vote could not be cast, and stays on the combo', () => {
      cy.intercept(VOTE, {
        statusCode: 403,
        body: { detail: 'You do not have permission to perform this action.' },
      }).as('vote');
      cy.visit('/salt/');

      cy.get('[data-salt-tick="1"]').should('not.be.disabled').click();
      cy.get('#salt-voting-vote').click();
      cy.wait('@vote');

      cy.get('#salt-voting-error').should('contain', 'not allowed to vote on salt');
      cy.get('#salt-voting-combo').should('contain', 'Mesmeric Orb');
      cy.get('#salt-voting-tally').should('contain', '0 voted · 0 skipped');
      expectSaltVotingSessions({ visited: 1 });
    });
  });
});

export {};
