import type { ScryfallEntry } from "./get-scryfall";

export default function isFeatured(sfData: ScryfallEntry): boolean {
  if (sfData.setData.reprint) {
    return false;
  }

  const setCode = sfData.setData.setCode;

  // update this logic for whatever set codes we
  // want to feature on the site
  return setCode === "mh2";
}
