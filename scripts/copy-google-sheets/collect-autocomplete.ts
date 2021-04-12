import normalizeStringInput from "../../lib/api/normalize-string-input";

import type { FormattedApiResponse } from "../../lib/api/types";
type AutoCompleteOption = {
  value: string;
  label: string;
};
type AutoCompleteOptionWithCount = {
  value: string;
  label: string;
  count: number;
};

function collectAutocompletes(
  items: string[],
  limit = 1
): AutoCompleteOption[] {
  return items
    .reduce((collection, item) => {
      const itemInCollection = collection.find(
        (piece) =>
          normalizeStringInput(item) === normalizeStringInput(piece.value)
      );

      if (itemInCollection) {
        itemInCollection.count++;
      } else if (!item.trim().match(/^[(*]/)) {
        collection.push({
          value: normalizeStringInput(item),
          label: item.trim(),
          count: 1,
        });
      }
      return collection;
    }, [] as AutoCompleteOptionWithCount[])
    .filter((option) => {
      return option.count >= limit;
    })
    .map((option) => {
      return {
        value: option.value,
        label: option.label,
      };
    })
    .sort((a, b) => {
      if (a.value > b.value) {
        return 1;
      } else if (a.value < b.value) {
        return -1;
      }

      return 0;
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
  return collectAutocompletes(
    combos.map((c) => Array.from(c.results)).flat(),
    30
  );
}
