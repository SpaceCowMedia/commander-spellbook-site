import CardGrouping from "./models/card-grouping";
import SpellbookList from "./models/list";
import ColorIdentity from "./models/color-identity";
import type { CompressedApiResponse, FormattedApiResponse } from "./types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const edhrecComboData = require("@/../external-data/edhrec-combos.json");

export default function formatApiResponse(
  apiResponse: CompressedApiResponse[]
): FormattedApiResponse[] {
  return apiResponse.map((combo) => {
    const id = combo.d;
    const cards = CardGrouping.create(combo.c);
    const colorIdentity = new ColorIdentity(combo.i);
    const prerequisites = SpellbookList.create(combo.p);
    const steps = SpellbookList.create(combo.s);
    const results = SpellbookList.create(combo.r);
    const hasBannedCard = cards.isBanned();
    const hasSpoiledCard = cards.isPreview();

    const data = {
      commanderSpellbookId: id,
      permalink: `https://commanderspellbook.com/combo/${id}/`,
      cards,
      colorIdentity,
      prerequisites,
      steps,
      results,
      hasBannedCard,
      hasSpoiledCard,
    } as FormattedApiResponse;

    if (id in edhrecComboData) {
      data.edhrecLink = `https://edhrec.com/combos/${edhrecComboData[id].slug}`;
      data.numberOfEDHRECDecks = edhrecComboData[id].numberOfDecks;
    } else {
      data.edhrecLink = "";
      data.numberOfEDHRECDecks = 0;
    }

    return data;
  });
}
