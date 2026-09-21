import { CardDetail, CardsApi, Template } from '@space-cow-media/spellbook-client';
import { ReplacementCard, ReplacementsPage } from 'lib/types';
import { apiConfiguration } from './api.service';
import { scryfallQueryReplacements } from './scryfall.service';

const PAGE_SIZE = 50;

function toReplacementCard(card: CardDetail): ReplacementCard {
  return {
    // a card no editor has curated has no id, but every card has a name
    id: card.oracleId ?? card.name,
    name: card.name,
    images: [card.imageUriFrontNormal, card.imageUriBackNormal].filter((uri) => uri != null),
    spoiler: card.spoiler,
  };
}

/* A template being drafted in the submission form is not saved yet, so it has no id the backend could
   match cards against: its query is searched on Scryfall instead. */
export async function templateReplacements(template: Template, page: number): Promise<ReplacementsPage> {
  if (!template.id) {
    return scryfallQueryReplacements(template.scryfallQuery ?? '', page);
  }
  const cardsApi = new CardsApi(apiConfiguration());
  const replacements = await cardsApi.cardsList({
    matchedBy: [template.id],
    limit: PAGE_SIZE,
    offset: PAGE_SIZE * page,
    count: true,
  });
  return {
    results: replacements.results.map(toReplacementCard),
    page: page,
    nextPage: replacements.next !== null ? page + 1 : undefined,
    count: replacements.count ?? undefined,
  };
}

const TemplateReplacementsService = {
  templateReplacements,
};

export default TemplateReplacementsService;
