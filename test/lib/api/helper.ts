import type { SearchParameters } from "@/lib/api/types";

export function makeSearchParams(
  options: Partial<SearchParameters> = {}
): SearchParameters {
  return Object.assign(
    {},
    {
      id: {
        includeFilters: [],
        excludeFilters: [],
      },
      cards: {
        sizeFilters: [],
        includeFilters: [],
        excludeFilters: [],
      },
      colorIdentity: {
        includeFilters: [],
        excludeFilters: [],
        sizeFilters: [],
      },
      prerequisites: {
        sizeFilters: [],
        includeFilters: [],
        excludeFilters: [],
      },
      steps: {
        sizeFilters: [],
        includeFilters: [],
        excludeFilters: [],
      },
      results: {
        sizeFilters: [],
        includeFilters: [],
        excludeFilters: [],
      },
      tags: {},
      errors: [],
    },
    options
  );
}
