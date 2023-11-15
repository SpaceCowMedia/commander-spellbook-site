import CardGrouping from "./models/card-grouping";
import ColorIdentity from "./models/color-identity";
import List from "./models/list";
import type {FormattedApiResponse, NewPrerequisiteType} from "./types";

export type SerializedCombo = {
  commanderSpellbookId: string;
  legacyId: string;
  permalink: string;
  cards: string[];
  colorIdentity: string;
  prerequisites: string;
  steps: string;
  results: string;
  hasBannedCard: boolean;
  hasSpoiledCard: boolean;
  edhrecLink: string;
  numberOfEDHRECDecks: number;
  prerequisiteList: NewPrerequisiteType[];
};

export function serializeCombo(combo: FormattedApiResponse): SerializedCombo {
  return {
    commanderSpellbookId: combo.commanderSpellbookId,
    legacyId: combo.legacyId,
    permalink: combo.permalink,
    cards: combo.cards.serialize(),
    colorIdentity: combo.colorIdentity.toString(),
    prerequisites: combo.prerequisites.toString(),
    steps: combo.steps.toString(),
    results: combo.results.toString(),
    hasBannedCard: combo.hasBannedCard,
    hasSpoiledCard: combo.hasSpoiledCard,
    edhrecLink: combo.edhrecLink,
    numberOfEDHRECDecks: combo.numberOfEDHRECDecks,
    prerequisiteList: combo.prerequisiteList,
  };
}

export function deserializeCombo(combo: SerializedCombo): FormattedApiResponse {
  return {
    commanderSpellbookId: combo.commanderSpellbookId,
    legacyId: combo.legacyId,
    permalink: combo.permalink,
    cards: CardGrouping.create(combo.cards),
    colorIdentity: new ColorIdentity(combo.colorIdentity),
    prerequisites: List.create(combo.prerequisites),
    steps: List.create(combo.steps),
    results: List.create(combo.results),
    hasBannedCard: combo.hasBannedCard,
    hasSpoiledCard: combo.hasSpoiledCard,
    edhrecLink: combo.edhrecLink,
    numberOfEDHRECDecks: combo.numberOfEDHRECDecks,
    prerequisiteList: combo.prerequisiteList,
  };
}
