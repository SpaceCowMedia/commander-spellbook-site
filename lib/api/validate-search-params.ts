import type { SearchParameters } from "./types";

const SEARCH_PARAMS_WITH_FILTERS: [
  "cards",
  "prerequisites",
  "steps",
  "results",
  "colorIdentity"
] = ["cards", "prerequisites", "steps", "results", "colorIdentity"];
const FILTER_KINDS: ["sizeFilters", "includeFilters", "excludeFilters"] = [
  "sizeFilters",
  "includeFilters",
  "excludeFilters",
];

export default function validateSearchParams(
  params: SearchParameters
): boolean {
  const hasComboDataRequirement = SEARCH_PARAMS_WITH_FILTERS.find((param) => {
    return FILTER_KINDS.find((filter) => {
      return params[param][filter].length > 0;
    });
  });

  if (hasComboDataRequirement) {
    return true;
  }

  if (params.edhrecDecks.sizeFilters.length > 0) {
    return true;
  }

  if (
    params.id.includeFilters.length > 0 ||
    params.id.excludeFilters.length > 0
  ) {
    return true;
  }

  if (params.tags.banned || params.tags.spoiled) {
    return true;
  }

  return false;
}
