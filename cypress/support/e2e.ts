import './commands';
import { stubScryfall } from './scryfall';

beforeEach(() => {
  // deny the cookies so we don't run google analytics tracking
  // during integration tests
  cy.clearLocalStorage().then((ls) => {
    ls.setItem('GDPR:accepted', 'false');
  });
  stubScryfall();
});

export {};
