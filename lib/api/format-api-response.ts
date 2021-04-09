import normalizeDatabaseValue from "./normalize-database-value";
import CardGrouping from "./models/card-grouping";
import SpellbookList from "./models/list";
import ColorIdentity from "./models/color-identity";
import type {
  CommanderSpellbookAPIResponse,
  FormattedApiResponse,
} from "./types";

export default function formatApiResponse(
  apiResponse: CommanderSpellbookAPIResponse
): FormattedApiResponse[] {
  return apiResponse.valueRanges[0].values
    .filter((combo) => {
      // ensures the spreadsheet has all values needed
      // in particular, the first card and a color identity
      return combo.length > 13 && combo[1] && combo[11];
    })
    .map((combo) => {
      return combo.map(normalizeDatabaseValue);
    })
    .map((combo) => {
      const id = combo[0];
      const cardNames = [
        combo[1],
        combo[2],
        combo[3],
        combo[4],
        combo[5],
        combo[6],
        combo[7],
        combo[8],
        combo[9],
        combo[10],
      ].filter((cardName) => cardName);

      const cards = CardGrouping.create(cardNames);
      const colorIdentity = new ColorIdentity(combo[11]);
      const prerequisites = SpellbookList.create(combo[12]);
      const steps = SpellbookList.create(combo[13]);
      const results = SpellbookList.create(combo[14]);
      const hasBannedCard = combo[15].toLowerCase() === "true";
      const hasSpoiledCard = combo[16].toLowerCase() === "true";

      return {
        commanderSpellbookId: id,
        permalink: `https://commanderspellbook.com/combo/${id}`,
        cards,
        colorIdentity,
        prerequisites,
        steps,
        results,
        hasBannedCard,
        hasSpoiledCard,
      };
    });
}
