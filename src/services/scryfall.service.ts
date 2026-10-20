import { ScryfallCard, ScryfallError, ScryfallList } from '@scryfall/api-types';
import { getFaceNames, ReplacementCard, ReplacementsPage } from 'lib/types';

export function scryfallCardUrl(cardName: string): string {
  const name = getFaceNames(cardName)[0];
  const quote = name.includes('"') ? "'" : '"';
  return `https://scryfall.com/search?q=${encodeURIComponent(`!${quote}${name}${quote}`)}`;
}

const SEARCH_URL = 'https://api.scryfall.com/cards/search';
/* Accept is all a search sends: the browser keeps its own User-Agent and needs no CORS preflight. */
const HEADERS = { Accept: 'application/json;q=0.9,*/*;q=0.8' };

/* Scryfall's WebP versions are newer than its API types. */
function gridImage(imageUris: object | undefined): string {
  return (imageUris as { grid?: string } | undefined)?.grid || '';
}

function getScryfallImage(card: ScryfallCard.Any): string[] {
  if ('image_uris' in card) {
    return [gridImage(card.image_uris)];
  } else if ('card_faces' in card) {
    const result = [];
    for (const face of card.card_faces) {
      if ('image_uris' in face) {
        result.push(gridImage(face.image_uris));
      }
    }
    return result;
  }
  return [''];
}

function toReplacementCard(card: ScryfallCard.Any): ReplacementCard {
  return {
    id: card.id,
    cardId: null,
    oracleId: 'oracle_id' in card ? card.oracle_id : null,
    name: card.name,
    images: getScryfallImage(card),
    spoiler: Date.parse(card.released_at) > Date.now(),
  };
}

/* Only a query still being typed in the submission form is searched on Scryfall: a saved template is
   matched against the cards by the backend itself. */
export async function scryfallQueryReplacements(scryfallQuery: string, page: number): Promise<ReplacementsPage> {
  const query = new URLSearchParams({ q: `(${scryfallQuery}) legal:commander`, page: `${page + 1}` }); // Scryfall pages are 1-indexed
  const response = await fetch(`${SEARCH_URL}?${query}`, { headers: HEADERS });
  if (!response.ok) {
    // a query that matches no card is an error too, whose details say so
    const error: ScryfallError = await response.json();
    throw new Error(error.details);
  }
  const list: ScryfallList.Cards = await response.json();
  return {
    results: list.data.map(toReplacementCard),
    page: page,
    nextPage: list.has_more ? page + 1 : undefined,
    count: list.total_cards,
  };
}
