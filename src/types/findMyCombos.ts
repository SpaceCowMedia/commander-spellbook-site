import {Variant} from "../lib/types";

export type FindMyCombosResponseType = {
  count: number,
  next: string | null,
  previous: string | null,
  results: {
    identity: string,
    included: Variant[],
    includedByChangingCommanders: Variant[],
    almostIncluded: Variant[],
    almostIncludedByAddingColors: Variant[],
    almostIncludedByChangingCommanders: Variant[],
    almostIncludedByAddingColorsAndChangingCommanders: Variant[],
  }
}
