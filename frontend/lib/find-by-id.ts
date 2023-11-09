import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";
import {invert} from "./backend-processors";

const ID_MAP_URL = 'https://spellbook-prod.s3.us-east-2.amazonaws.com/variant_id_map.json'
export default async function findById(
  id: string | number,
  useBackend = false
): Promise<FormattedApiResponse> {
  id = String(id);

  const combos = await lookupApi(useBackend);

  const combo = combos.find((c) => c.commanderSpellbookId === id);

  if (!combo) {
    return Promise.reject(
      new Error(`Combo with id "${id}" could not be found.`)
    );
  }

  return combo;
}
