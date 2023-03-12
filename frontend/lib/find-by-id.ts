import lookupApi, { lookupApiCompressed } from "./spellbook-api";

import type { CompressedApiResponse, FormattedApiResponse } from "./types";

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

export async function findByIdCompressed(
  id: string | number,
  useGoogleSheetsEndpoint = false
): Promise<CompressedApiResponse> {
  id = String(id);

  const combos = await lookupApiCompressed(useGoogleSheetsEndpoint);
  const combo = combos.find((c) => c.d === id);

  if (!combo) {
    return Promise.reject(
      new Error(`Combo with id "${id}" could not be found.`)
    );
  }

  return combo;
}
