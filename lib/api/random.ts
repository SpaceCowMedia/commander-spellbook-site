import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";

export default async function random(): Promise<FormattedApiResponse> {
  const combos = await lookupApi();
  const randomIndex = Math.floor(Math.random() * combos.length);

  return combos[randomIndex];
}
