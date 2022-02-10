import type { SearchParameters, FormattedApiResponse } from "../types";

export default function filterIds(
  combos: FormattedApiResponse[],
  params: SearchParameters
): FormattedApiResponse[] {
  if (params.id.includeFilters.length > 0) {
    if (params.id.includeFilters.length > 1) {
      const value = params.id.includeFilters.join("|");

      params.errors.push({
        key: "id",
        value,
        message: `Multiple includsive id parameters present (${value}).`,
      });
    } else {
      const id = params.id.includeFilters[0];
      const comboWithId = combos.find((combo) => {
        return combo.commanderSpellbookId === id;
      });

      if (!comboWithId) {
        combos = [];

        params.errors.push({
          key: "id",
          value: id,
          message: `No combo with id "${id}" could be found.`,
        });
      } else {
        combos = [comboWithId];
      }
    }
  }

  if (params.id.excludeFilters.length > 0) {
    params.id.excludeFilters.forEach((id) => {
      combos = combos.filter((combo) => {
        return combo.commanderSpellbookId !== id;
      });
    });
  }

  return combos;
}
