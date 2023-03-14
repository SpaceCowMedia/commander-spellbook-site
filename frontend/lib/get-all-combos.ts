import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";

export default async function getAllCombos(): Promise<FormattedApiResponse[]> {
  const combos = await lookupApi();

  return combos;
}
