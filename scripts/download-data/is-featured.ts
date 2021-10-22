import type { ScryfallEntry } from "./get-scryfall";

export default function isFeatured(sfData: ScryfallEntry): boolean {
  if (sfData.setData.reprint) {
    return false;
  }

  const cNum = Number(sfData.collectorNumber);
  const setCode = sfData.setData.setCode;

  // update this logic for whatever set codes we
  // want to feature on the site
  // currently set to Secret Lair, with the collector numbers for Stranger Things
  return setCode === "sld" && (cNum === 608 || (cNum > 339 && cNum < 348));
}
