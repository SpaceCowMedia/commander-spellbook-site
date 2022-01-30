import lookupApi from "./spellbook-api";
import parseQuery from "./parse-query";
import filterIds from "./search-filters/ids";
import filterColorIdentity from "./search-filters/color-identity";
import filterComboData from "./search-filters/combo-data";
import filterSize from "./search-filters/size";
import filterPrice from "./search-filters/price";
import filterTags from "./search-filters/tags";
import sortCombos from "./sort-combos";
import createMessage from "./parse-query/create-message";
import validateSearchParams from "./validate-search-params";

import type { SearchResults } from "./types";

import { DEFAULT_ORDER, DEFAULT_SORT, DEFAULT_VENDOR } from "@/lib/constants";

export default async function search(query = ""): Promise<SearchResults> {
  const searchParams = parseQuery(query);
  const sort = searchParams.sort || DEFAULT_SORT;
  const order = searchParams.order || DEFAULT_ORDER;
  const vendor = searchParams.price.vendor || DEFAULT_VENDOR;
  const { errors } = searchParams;

  if (!validateSearchParams(searchParams)) {
    return {
      errors,
      vendor,
      sort,
      order,
      combos: [],
      message: "No valid search parameters submitted",
    };
  }

  let combos = await lookupApi();

  combos = filterIds(combos, searchParams);
  combos = filterColorIdentity(combos, searchParams);
  combos = filterComboData(combos, searchParams);
  combos = filterSize(combos, searchParams);
  combos = filterPrice(combos, searchParams);
  combos = filterTags(combos, searchParams);
  combos = sortCombos(combos, { by: sort, order, vendor });

  return {
    errors,
    sort,
    order,
    vendor,
    combos,
    message: createMessage(combos, searchParams),
  };
}
