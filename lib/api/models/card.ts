import scryfall from "scryfall-client";
import normalizeStringInput from "../normalize-string-input";
import getExternalCardData, {
  ExternalCardData,
} from "../../get-external-card-data";

export default class Card {
  name: string;
  private externalData: ExternalCardData;
  private normalizedName: string;

  constructor(cardName: string) {
    this.name = cardName;
    this.normalizedName = normalizeStringInput(cardName);
    this.externalData = getExternalCardData(cardName);
  }

  matchesName(cardName: string): boolean {
    return this.normalizedName.includes(normalizeStringInput(cardName));
  }

  matchesNameExactly(cardName: string): boolean {
    return this.normalizedName === normalizeStringInput(cardName);
  }

  getScryfallData(): ReturnType<typeof scryfall.getCard> {
    return scryfall.getCard(this.name, "exactName");
  }

  getImageUrl(kind: "artCrop" | "oracle"): string {
    return this.externalData.images[kind];
  }

  getPrice(kind: "tcgplayer" | "cardkingdom"): number {
    return this.externalData.prices[kind] || 0;
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
