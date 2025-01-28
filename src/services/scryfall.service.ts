import { ScryfallCard } from '@scryfall/api-types';
import { CardsApi, Template } from '@spacecowmedia/spellbook-client';
import scryfall from 'scryfall-client';
import Card from 'scryfall-client/dist/models/card';
import List from 'scryfall-client/dist/models/list';
import { apiConfiguration } from './api.service';

const SCRYFALL_SEARCH_PAGE_SIZE = 175;
const SPELLBOOK_PAGE_SIZE = 50;
const SCRYFALL_COLLECTION_PAGE_SIZE = 75;

function getPageSize(template: Template): number {
  return template.scryfallQuery
    ? SCRYFALL_SEARCH_PAGE_SIZE
    : Math.min(SPELLBOOK_PAGE_SIZE, SCRYFALL_COLLECTION_PAGE_SIZE);
}

export function getScryfallImage(card: ScryfallCard.Any | Card): string[] {
  if ('image_uris' in card) {
    return [card.image_uris?.normal || ''];
  } else if ('card_faces' in card) {
    let result = [];
    for (let face of card.card_faces) {
      if ('image_uris' in face) {
        result.push(face.image_uris?.normal || '');
      }
    }
    return result;
  }
  return [''];
}

export type ScryfallResultsPage = {
  results: List<Card>;
  page: number;
  nextPage?: number;
  count?: number;
};

export async function templateReplacements(template: Template, page: number): Promise<ScryfallResultsPage> {
  if (template.scryfallQuery) {
    const response = await scryfall.search(template.scryfallQuery + ' legal:commander', { page: page + 1 }); // Scryfall pages are 1-indexed
    return {
      results: response,
      page: page,
      nextPage: response.has_more ? page + 1 : undefined,
      count: response.total_cards,
    };
  } else {
    const configuration = apiConfiguration();
    const cardsApi = new CardsApi(configuration);
    const pageSize = getPageSize(template);
    const replacements = await cardsApi.cardsList({
      limit: pageSize,
      replaces: [template.id],
      offset: pageSize * page,
    });
    const response = await scryfall.getCollection(
      replacements.results.map((card) =>
        card.oracleId
          ? {
              oracle_id: card.oracleId,
            }
          : {
              name: card.name,
            },
      ),
    );
    return {
      results: response,
      page: page,
      nextPage: replacements.next !== null ? page + 1 : undefined,
      count: replacements.count,
    };
  }
}

const ScryfallService = {
  getScryfallImage,
  templateReplacements,
};

export default ScryfallService;
