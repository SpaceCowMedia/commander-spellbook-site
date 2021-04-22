import lookupApi from "./spellbook-api";

import type { FormattedApiResponse } from "./types";

export default async function getFeaturedCombos(): Promise<
  FormattedApiResponse[]
> {
  const combos = await lookupApi();

  return combos.filter((combo) => {
    return combo.cards.isFeatured();
  });
}
