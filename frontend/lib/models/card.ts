import scryfall from "scryfall-client";
import normalizeStringInput from "../normalizeStringInput";
import type { VendorValue } from "../types";

import getExternalCardData, { ExternalCardData } from "lib/getExternalCardData";

export default class Card {
  name: string;
  private externalData: ExternalCardData;
  private normalizedName: string;
  aliases: string[];

  constructor(cardName: string) {
    this.name = cardName;
    this.normalizedName = normalizeStringInput(cardName);
    this.externalData = getExternalCardData(cardName);
    this.aliases = this.externalData.aliases;
  }

  matchesName(cardName: string): boolean {
    const normalName = normalizeStringInput(cardName);
    const matchesMainName = this.normalizedName.includes(normalName);

    if (matchesMainName) {
      return true;
    }

    const matchesAlias = Boolean(
      this.aliases.find((name) => {
        return name.includes(normalName);
      })
    );

    return matchesAlias;
  }

  matchesNameExactly(cardName: string): boolean {
    const normalName = normalizeStringInput(cardName);
    const matchesMainNameExactly = this.normalizedName === normalName;

    if (matchesMainNameExactly) {
      return true;
    }

    const matchesAliasExactly = Boolean(
      this.aliases.find((name) => {
        return name === normalName;
      })
    );

    return matchesAliasExactly;
  }

  getScryfallData(): ReturnType<typeof scryfall.getCard> {
    return scryfall.getCard(this.name, "exactName");
  }

  getImageUrl(kind: "artCrop" | "oracle"): string {
    return this.externalData.images[kind];
  }

  getPrice(kind: VendorValue): number {
    return this.externalData.prices[kind];
  }

  isFeatured(): boolean {
    return this.externalData.isFeatured;
  }

  isBanned(): boolean {
    return this.externalData.isBanned;
  }

  isPreview(): boolean {
    return this.externalData.isPreview;
  }

  getEdhrecLink(): string {
    return this.externalData.edhrecLink;
  }

  toString(): string {
    return this.name;
  }
}
