import normalizeDatabaseValue from "./normalize-database-value";
import type {
  CommanderSpellbookAPIResponse,
  CompressedApiResponse,
} from "./types";

export default function transformGoogleSheetsData(
  apiResponse: CommanderSpellbookAPIResponse
): CompressedApiResponse[] {
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

      const colorIdentity = combo[11];
      const prerequisites = combo[12];
      const steps = combo[13];
      const results = combo[14];

      const data: CompressedApiResponse = {
        d: id,
        c: cardNames,
        i: colorIdentity,
        p: prerequisites,
        s: steps,
        r: results,
      };

      return data;
    });
}
