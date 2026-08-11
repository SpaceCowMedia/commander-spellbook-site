// Scryfall is an external service that rate limits and answers at unpredictable speed, which made
// the autocompletes race against the rest of the page in CI. Every call is stubbed with the cards
// that .github/actions/backend/action.yaml seeds into the test database.

const SCRYFALL_API = 'https://api.scryfall.com';

const SEEDED_CARDS = [
  { name: 'Basalt Monolith', oracleId: '6b8cf2a0-b045-4d91-9d91-c602d40c6237', typeLine: 'Artifact' },
  { name: 'Mesmeric Orb', oracleId: '03efb4f3-b8e2-4441-824f-886dc40712c4', typeLine: 'Artifact' },
  { name: 'Forsaken Monument', oracleId: '7777fab1-df3f-467f-b9e2-46dd2bd2166e', typeLine: 'Legendary Artifact' },
];

type SeededCard = (typeof SEEDED_CARDS)[number];

const PLACEHOLDER_IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />';

const imageReply = { headers: { 'content-type': 'image/svg+xml' }, body: PLACEHOLDER_IMAGE };

const normalize = (value: string) => value.trim().toLowerCase();

const imageUris = (name: string) => {
  const uri = `${SCRYFALL_API}/cards/named?format=image&version=normal&exact=${encodeURIComponent(name)}`;
  return { small: uri, normal: uri, large: uri, png: uri, art_crop: uri, border_crop: uri };
};

const cardObject = (card: SeededCard) => ({
  object: 'card',
  id: card.oracleId,
  oracle_id: card.oracleId,
  name: card.name,
  layout: 'normal',
  type_line: card.typeLine,
  image_uris: imageUris(card.name),
});

const catalog = (names: string[]) => ({ object: 'catalog', total_values: names.length, data: names });

const list = (cards: SeededCard[], notFound: unknown[] = []) => ({
  object: 'list',
  has_more: false,
  total_cards: cards.length,
  data: cards.map(cardObject),
  not_found: notFound,
});

const matching = (query: string) => SEEDED_CARDS.filter((card) => normalize(card.name).includes(normalize(query)));

const exactly = (name: string) => SEEDED_CARDS.find((card) => normalize(card.name) === normalize(name));

const notFoundReply = {
  statusCode: 404,
  body: { object: 'error', status: 404, code: 'not_found', details: 'No card found.' },
};

export const stubScryfall = () => {
  cy.intercept({ method: 'GET', url: `${SCRYFALL_API}/cards/autocomplete*` }, (req) => {
    const query = new URL(req.url).searchParams.get('q') ?? '';
    req.reply(catalog(matching(query).map((card) => card.name)));
  }).as('scryfallAutocomplete');

  cy.intercept({ method: 'GET', url: `${SCRYFALL_API}/cards/named*` }, (req) => {
    const params = new URL(req.url).searchParams;
    if (params.get('format') === 'image') {
      return req.reply(imageReply);
    }
    const name = params.get('exact') ?? params.get('fuzzy') ?? '';
    const card = exactly(name) ?? matching(name)[0];
    req.reply(card ? cardObject(card) : notFoundReply);
  });

  // Any query matches every seeded card, so a template query is never reported as invalid.
  cy.intercept({ method: 'GET', url: `${SCRYFALL_API}/cards/search*` }, (req) => req.reply(list(SEEDED_CARDS)));

  cy.intercept({ method: 'POST', url: `${SCRYFALL_API}/cards/collection` }, (req) => {
    const identifiers: { oracle_id?: string; name?: string }[] = req.body?.identifiers ?? [];
    const found: SeededCard[] = [];
    const notFound: unknown[] = [];
    for (const identifier of identifiers) {
      const card = SEEDED_CARDS.find(
        (seeded) =>
          (identifier.oracle_id && seeded.oracleId === identifier.oracle_id) ||
          (identifier.name && normalize(seeded.name) === normalize(identifier.name)),
      );
      if (card) {
        found.push(card);
      } else {
        notFound.push(identifier);
      }
    }
    req.reply(list(found, notFound));
  });

  cy.intercept({ url: 'https://svgs.scryfall.io/**' }, (req) => req.reply(imageReply));
  cy.intercept({ url: 'https://cards.scryfall.io/**' }, (req) => req.reply(imageReply));
};
