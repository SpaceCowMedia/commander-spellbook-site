// Scryfall is an external service that rate limits and answers at unpredictable speed, which made
// the tests race against the rest of the page in CI. The site only searches it for the preview of a
// template query drafted in the submission form, which is stubbed with the cards that
// .github/actions/backend/action.yaml seeds into the test database, and loads card images from it.

const SCRYFALL_API = 'https://api.scryfall.com';

const SEEDED_CARDS = [
  { name: 'Basalt Monolith', oracleId: '6b8cf2a0-b045-4d91-9d91-c602d40c6237', typeLine: 'Artifact' },
  { name: 'Mesmeric Orb', oracleId: '03efb4f3-b8e2-4441-824f-886dc40712c4', typeLine: 'Artifact' },
  { name: 'Forsaken Monument', oracleId: '7777fab1-df3f-467f-b9e2-46dd2bd2166e', typeLine: 'Legendary Artifact' },
];

type SeededCard = (typeof SEEDED_CARDS)[number];

const PLACEHOLDER_IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />';

const imageReply = { headers: { 'content-type': 'image/svg+xml' }, body: PLACEHOLDER_IMAGE };

const imageUris = (card: SeededCard) => {
  const uri = `https://cards.scryfall.io/normal/front/${card.oracleId}.jpg`;
  return { small: uri, normal: uri, large: uri, png: uri, art_crop: uri, border_crop: uri };
};

const cardObject = (card: SeededCard, spoilers: string[]) => ({
  object: 'card',
  id: card.oracleId,
  oracle_id: card.oracleId,
  name: card.name,
  layout: 'normal',
  type_line: card.typeLine,
  image_uris: imageUris(card),
  // a card Scryfall is still previewing comes out after today
  released_at: spoilers.includes(card.name) ? '2999-01-01' : '2000-01-01',
});

const list = (cards: SeededCard[], spoilers: string[]) => ({
  object: 'list',
  has_more: false,
  total_cards: cards.length,
  data: cards.map((card) => cardObject(card, spoilers)),
});

// Any query matches every seeded card, so a template query is never reported as invalid.
export const stubScryfallSearch = (spoilers: string[] = []) => {
  cy.intercept({ method: 'GET', url: `${SCRYFALL_API}/cards/search*` }, (req) =>
    req.reply(list(SEEDED_CARDS, spoilers)),
  );
};

export const stubScryfall = () => {
  stubScryfallSearch();

  cy.intercept({ url: 'https://svgs.scryfall.io/**' }, (req) => req.reply(imageReply));
  cy.intercept({ url: 'https://cards.scryfall.io/**' }, (req) => req.reply(imageReply));
};
