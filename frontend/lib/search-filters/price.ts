import type { SearchParameters, FormattedApiResponse } from "../types";
import { DEFAULT_VENDOR } from "lib/constants";

export default function filterPrice(
  combos: FormattedApiResponse[],
  params: SearchParameters
): FormattedApiResponse[] {
  if (params.price.filters.length === 0) {
    return combos;
  }

  const vendor = params.price.vendor || DEFAULT_VENDOR;

  combos = combos.filter((combo) => {
    const price = combo.cards.getPrice(vendor);

    if (price === 0) {
      return false;
    }

    return params.price.filters.every((filter) => {
      switch (filter.method) {
        case ":":
        case "=":
          return price === filter.value;
        case ">":
          return price > filter.value;
        case ">=":
          return price >= filter.value;
        case "<":
          return price < filter.value;
        case "<=":
          return price <= filter.value;
        default:
          return true;
      }
    });
  });

  return combos;
}
