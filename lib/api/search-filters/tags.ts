import type { SearchParameters, FormattedApiResponse } from "../types";

export const SIZE_RESTRICTED_FILTERS: [
  "colorIdentity",
  "cards",
  "prerequisites",
  "steps",
  "results"
] = ["colorIdentity", "cards", "prerequisites", "steps", "results"];

export default function filterTags(
  combos: FormattedApiResponse[],
  params: SearchParameters
): FormattedApiResponse[] {
  const bannedParam = params.tags.banned || "exclude";
  const spoiledParam = params.tags.spoiled || "include";

  combos = combos.filter((combo) => {
    if (
      (bannedParam === "exclude" || bannedParam === "not") &&
      combo.hasBannedCard
    ) {
      return false;
    }
    if (
      (spoiledParam === "exclude" || spoiledParam === "not") &&
      combo.hasSpoiledCard
    ) {
      return false;
    }

    if (spoiledParam === "is" && bannedParam === "is") {
      return combo.hasBannedCard && combo.hasSpoiledCard;
    }

    if (bannedParam === "is") {
      return combo.hasBannedCard;
    }

    if (spoiledParam === "is") {
      return combo.hasSpoiledCard;
    }

    return true;
  });

  return combos;
}
