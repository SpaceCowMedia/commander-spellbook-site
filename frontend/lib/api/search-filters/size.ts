import type {
  SearchParameters,
  FormattedApiResponse,
  SizeFilter,
} from "../types";

export const SIZE_RESTRICTED_FILTERS: [
  "colorIdentity",
  "cards",
  "prerequisites",
  "steps",
  "results"
] = ["colorIdentity", "cards", "prerequisites", "steps", "results"];

function filterBySize(filter: SizeFilter, numberOfValues?: number): boolean {
  if (!numberOfValues) {
    return false;
  }
  switch (filter.method) {
    case ":":
    case "=":
      return numberOfValues === filter.value;
    case ">":
      return numberOfValues > filter.value;
    case ">=":
      return numberOfValues >= filter.value;
    case "<":
      return numberOfValues < filter.value;
    case "<=":
      return numberOfValues <= filter.value;
    default:
      return true;
  }
}

export default function filterSize(
  combos: FormattedApiResponse[],
  params: SearchParameters
): FormattedApiResponse[] {
  params.edhrecDecks.sizeFilters.forEach((filter) => {
    combos = combos.filter((combo) => {
      return filterBySize(filter, combo.numberOfEDHRECDecks);
    });
  });

  SIZE_RESTRICTED_FILTERS.forEach((dataType) => {
    if (params[dataType].sizeFilters.length > 0) {
      combos = combos.filter((combo) => {
        const numberOfValues = combo[dataType].size();

        return params[dataType].sizeFilters.every((filter) => {
          return filterBySize(filter, numberOfValues);
        });
      });
    }
  });

  return combos;
}
