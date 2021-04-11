import normalizeStringInput from "../../lib/api/normalize-string-input";

import type { FormattedApiResponse } from "../../lib/api/types";
type AutoCompleteOption = {
  value: string;
  label: string;
};

function collectAutocompletes(items: string[]): AutoCompleteOption[] {
  return items
    .reduce((collection, item) => {
      if (
        !collection.find(
          (piece) => normalizeStringInput(item) === normalizeStringInput(piece)
        )
      ) {
        if (!item.trim().match(/^[(*]/)) {
          collection.push(item.trim());
        }
      }
      return collection;
    }, [] as string[])
    .sort()
    .map((option) => {
      return {
        value: normalizeStringInput(option),
        label: option,
      };
    });
}

export function collectCardNames(
  combos: FormattedApiResponse[]
): AutoCompleteOption[] {
  return collectAutocompletes(
    combos.map((c) => c.cards.map((card) => card.name)).flat()
  );
}

export function collectResults(
  combos: FormattedApiResponse[]
): AutoCompleteOption[] {
  return collectAutocompletes(combos.map((c) => Array.from(c.results)).flat());
}
