import type { SearchParameters, FormattedApiResponse } from "../types";

export const DATA_TYPES: ["cards", "prerequisites", "steps", "results"] = [
  "cards",
  "prerequisites",
  "steps",
  "results",
];

export default function filterComboData(
  combos: FormattedApiResponse[],
  searchParams: SearchParameters
): FormattedApiResponse[] {
  DATA_TYPES.forEach((dataType) => {
    if (searchParams[dataType].includeFilters.length > 0) {
      combos = combos.filter((combo) => {
        return searchParams[dataType].includeFilters.every((filter) => {
          if (filter.method === "=") {
            return combo[dataType].includesValueExactly(filter.value);
          }

          return combo[dataType].includesValue(filter.value);
        });
      });
    }

    if (searchParams[dataType].excludeFilters.length > 0) {
      combos = combos.filter((combo) => {
        return !searchParams[dataType].excludeFilters.find((filter) => {
          if (filter.method === "=") {
            return combo[dataType].includesValueExactly(filter.value);
          }

          return combo[dataType].includesValue(filter.value);
        });
      });
    }
  });

  return combos;
}
