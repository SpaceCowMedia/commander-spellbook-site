import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";

export default async function findById(
  id: string | number,
  useGoogleSheetsEndpoint = false
): Promise<FormattedApiResponse> {
  id = String(id);

  const combos = await lookupApi(useGoogleSheetsEndpoint);
  const combo = combos.find((c) => c.commanderSpellbookId === id);

  if (!combo) {
    return Promise.reject(
      new Error(`Combo with id "${id}" could not be found.`)
    );
  }

  return combo;
}