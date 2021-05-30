import COLOR_ORDER from "./color-combo-order";

import type {
  FormattedApiResponse,
  OrderValue,
  SortValue,
  VendorValue,
} from "./types";

type SortingMeta = {
  isEqual: boolean;
  firstRemainsFirst: boolean;
};

type SortOptions = {
  by: SortValue;
  order: OrderValue;
  vendor: VendorValue;
};

const ORDER_DEFAULTS: Record<SortValue, OrderValue> = {
  prerequisites: "ascending",
  steps: "ascending",
  results: "ascending",
  cards: "ascending",
  colors: "ascending",
  id: "ascending",

  popularity: "descending",
  price: "descending",
};

function handleSortingForNumberOfElements(
  firstCombo: FormattedApiResponse,
  secondCombo: FormattedApiResponse,
  prop: "cards" | "prerequisites" | "steps" | "results"
): SortingMeta {
  const isEqual = firstCombo[prop].length === secondCombo[prop].length;
  const firstRemainsFirst = firstCombo[prop].length > secondCombo[prop].length;

  return {
    isEqual,
    firstRemainsFirst,
  };
}

function handleSortingByColorIdentity(
  firstCombo: FormattedApiResponse,
  secondCombo: FormattedApiResponse
): SortingMeta {
  const firstIndexInColorOrder = COLOR_ORDER.findIndex((colorCombo) => {
    return firstCombo.colorIdentity.is(colorCombo);
  });
  const secondIndexInColorOrder = COLOR_ORDER.findIndex((colorCombo) => {
    return secondCombo.colorIdentity.is(colorCombo);
  });
  const isEqual = firstIndexInColorOrder === secondIndexInColorOrder;
  const firstRemainsFirst = firstIndexInColorOrder > secondIndexInColorOrder;

  if (isEqual) {
    return handleSortingForNumberOfElements(firstCombo, secondCombo, "cards");
  }

  return {
    isEqual,
    firstRemainsFirst,
  };
}

function handleSortingByPopularity(
  firstCombo: FormattedApiResponse,
  secondCombo: FormattedApiResponse
): SortingMeta {
  const firstDecks = Number(firstCombo.numberOfEDHRECDecks);
  const secondDecks = Number(secondCombo.numberOfEDHRECDecks);
  const isEqual = firstDecks === secondDecks;
  const firstRemainsFirst = firstDecks > secondDecks;

  if (isEqual) {
    return handleSortingByColorIdentity(firstCombo, secondCombo);
  }

  return {
    isEqual,
    firstRemainsFirst,
  };
}

function handleSortingByPrice(
  firstCombo: FormattedApiResponse,
  secondCombo: FormattedApiResponse,
  vendor: VendorValue
): SortingMeta {
  const firstPrice = firstCombo.cards.getPrice(vendor);
  const secondPrice = secondCombo.cards.getPrice(vendor);
  const isEqual = firstPrice === secondPrice;
  const firstRemainsFirst = firstPrice > secondPrice;

  if (isEqual) {
    return handleSortingByColorIdentity(firstCombo, secondCombo);
  }

  return {
    isEqual,
    firstRemainsFirst,
  };
}

export default function sortCombos(
  combos: FormattedApiResponse[],
  { by, order, vendor }: SortOptions
): FormattedApiResponse[] {
  if (order === "auto") {
    order = ORDER_DEFAULTS[by];
  }

  combos = combos.sort((firstCombo, secondCombo) => {
    let meta = {
      isEqual: false,
      firstRemainsFirst: true,
    };

    switch (by) {
      case "id":
        meta.isEqual =
          firstCombo.commanderSpellbookId === secondCombo.commanderSpellbookId;
        meta.firstRemainsFirst =
          firstCombo.commanderSpellbookId > secondCombo.commanderSpellbookId;
        break;
      case "cards":
      case "prerequisites":
      case "steps":
      case "results":
        meta = handleSortingForNumberOfElements(firstCombo, secondCombo, by);
        break;
      case "colors":
        meta = handleSortingByColorIdentity(firstCombo, secondCombo);
        break;
      case "popularity":
        meta = handleSortingByPopularity(firstCombo, secondCombo);
        break;
      case "price":
        meta = handleSortingByPrice(firstCombo, secondCombo, vendor);
        break;
    }

    if (meta.isEqual) {
      return 0;
    }

    return meta.firstRemainsFirst ? 1 : -1;
  });

  if (order === "descending") {
    combos.reverse();
  }

  return combos;
}
