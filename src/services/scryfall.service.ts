import { ScryfallCard } from '@scryfall/api-types';
import scryfall from 'scryfall-client';
import Card from 'scryfall-client/dist/models/card';
import { ReplacementCard, ReplacementsPage } from 'lib/types';

function getScryfallImage(card: ScryfallCard.Any | Card): string[] {
  if ('image_uris' in card) {
    return [card.image_uris?.normal || ''];
  } else if ('card_faces' in card) {
    const result = [];
    for (const face of card.card_faces) {
      if ('image_uris' in face) {
        result.push(face.image_uris?.normal || '');
      }
    }
    return result;
  }
  return [''];
}

function toReplacementCard(card: Card): ReplacementCard {
  return {
    id: card.id,
    name: card.name,
    images: getScryfallImage(card),
    spoiler: Date.parse(card.released_at) > Date.now(),
  };
}

/* Only a query still being typed in the submission form is searched on Scryfall: a saved template is
   matched against the cards by the backend itself. */
export async function scryfallQueryReplacements(scryfallQuery: string, page: number): Promise<ReplacementsPage> {
  const response = await scryfall.search(`(${scryfallQuery}) legal:commander`, { page: page + 1 }); // Scryfall pages are 1-indexed
  return {
    results: response.map(toReplacementCard),
    page: page,
    nextPage: response.has_more ? page + 1 : undefined,
    count: response.total_cards,
  };
}
