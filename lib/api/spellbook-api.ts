import superagent from "superagent";
import normalizeDatabaseValue from "./normalize-database-value";
import CardGrouping from "./models/card-grouping";
import SpellbookList from "./models/list";
import ColorIdentity from "./models/color-identity";
import type {
  CommanderSpellbookCombos,
  CommanderSpellbookAPIResponse,
  FormattedApiResponse,
} from "./types";

const API_ENDPOINT =
  "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";

let cachedPromise: Promise<FormattedApiResponse[]>;
let useCachedResponse = false;

function formatApiResponse(
  apiResponse: CommanderSpellbookCombos
): FormattedApiResponse[] {
  return apiResponse
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
        permalink: `https://commanderspellbook.com/?id=${id}`,
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

export default function lookupApi(): Promise<FormattedApiResponse[]> {
  if (useCachedResponse) {
    return cachedPromise;
  }

  cachedPromise = superagent
    .get(API_ENDPOINT)
    .then((res) => {
      const apiResponse = res.body as CommanderSpellbookAPIResponse;

      return apiResponse.valueRanges[0].values;
    })
    .then((values) => formatApiResponse(values));

  useCachedResponse = true;

  return cachedPromise;
}

export function resetCache(): void {
  useCachedResponse = false;
}
