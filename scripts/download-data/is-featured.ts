import type { ScryfallEntry } from "./get-scryfall";

// TODO shouldn't have to duplicate this here
// probably something to put in workspaces when
// we can do that work. See #211
type FeaturedRule = {
  kind: "card";
  setCode?: string;
  cardName?: string;
};

// TODO this is (hopefully) temporary and in the future,
// when the combos and cards are stored in the Firestore
// DB, the featured page can be responsible for looking up
// the featured combos
export default function isFeatured(
  sfData: ScryfallEntry,
  rules: FeaturedRule[]
): boolean {
  if (sfData.setData.reprint) {
    return false;
  }

  const setCode = sfData.setData.setCode;

  return rules.some((rule) => {
    if (rule.kind === "card") {
      return rule.setCode === setCode;
    }

    return false;
  });
}
