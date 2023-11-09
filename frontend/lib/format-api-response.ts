import CardGrouping from "./models/card-grouping";
import SpellbookList from "./models/list";
import ColorIdentity from "./models/color-identity";
import type { CompressedApiResponse, FormattedApiResponse } from "./types";
import edhrecComboData from "assets/external-data/edhrec-combos.json";


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
      prerequisiteList: combo.t || [],
    } as FormattedApiResponse;

    if (id in edhrecComboData) {
      // @ts-ignore
      data.edhrecLink = `https://edhrec.com/combos/${edhrecComboData[id].slug}`;
      // @ts-ignore
      data.numberOfEDHRECDecks = edhrecComboData[id].numberOfDecks || 0;
    } else {
      data.edhrecLink = "";
      data.numberOfEDHRECDecks = 0;
    }

    return data;
  });
}
