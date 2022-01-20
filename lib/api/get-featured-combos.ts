import lookupApi from "./spellbook-api";
import sortCombos from "./sort-combos";

import type { FormattedApiResponse } from "./types";

export default async function getFeaturedCombos(): Promise<
  FormattedApiResponse[]
> {
  const combos = await lookupApi();

  const featuredCombos = combos.filter((combo) => {
    return combo.cards.isFeatured();
  });

  return sortCombos(featuredCombos, {
    by: "popularity",
    order: "descending",
    vendor: "cardkingdom",
  });
}
