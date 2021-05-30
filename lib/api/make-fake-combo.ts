import CardGrouping from "./models/card-grouping";
import SpellbookList from "./models/list";
import ColorIdentity from "./models/color-identity";

import type { FormattedApiResponse } from "./types";

type FakeComboOptions = {
  commanderSpellbookId?: string;
  cards?: string[];
  colorIdentity?: string;
  prerequisites?: string[];
  steps?: string[];
  results?: string[];
  hasBannedCard?: boolean;
  hasSpoiledCard?: boolean;
  price?: number;
  edhrecLink?: boolean;
  numberOfEDHRECDecks?: number;
};

export default function makeFakeCombo(
  options: FakeComboOptions = {}
): FormattedApiResponse {
  const id = options.commanderSpellbookId || "123";
  const colorIdentity = new ColorIdentity(options.colorIdentity || "wub");
  const edhrecLink =
    options.edhrecLink === false
      ? ""
      : `https://edhrec.com/combos/${colorIdentity.toString()}/${id}`;
  const numberOfEDHRECDecks =
    options.numberOfEDHRECDecks != null ? options.numberOfEDHRECDecks : 35;

  const payload = {
    commanderSpellbookId: id,
    permalink: `https://commanderspellbook.com/combo/${id}/`,
    cards: CardGrouping.create(options.cards || ["card 1", "card 2"]),
    colorIdentity,
    prerequisites: SpellbookList.create(
      options.prerequisites?.join(". ") || "pre 1. pre 2"
    ),
    steps: SpellbookList.create(options.steps?.join(". ") || "step 1. step 2"),
    results: SpellbookList.create(
      options.results?.join(". ") || "result 1. result 2"
    ),
    hasBannedCard: options.hasBannedCard || false,
    hasSpoiledCard: options.hasSpoiledCard || false,
    edhrecLink,
    numberOfEDHRECDecks,
  } as FormattedApiResponse;

  if (options.price != null) {
    payload.cards.getPrice = function () {
      return options.price as number;
    };
  }

  return payload;
}
