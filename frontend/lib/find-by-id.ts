import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";
import {invert} from "./backend-processors";
export default async function findById(
  id: string | number,
  useBackend = false,
  useLegacyId = false
): Promise<FormattedApiResponse | undefined> {
  id = String(id);

  const combos = await lookupApi(useBackend);

  return combos.find((c) => useLegacyId ? c.legacyId === id : c.commanderSpellbookId === id);
}
