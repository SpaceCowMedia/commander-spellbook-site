import scryfall from "scryfall-client";
import normalizeStringInput from "../normalize-string-input";

const CARD_IMAGE_NAMED_BASE_URL =
  "https://api.scryfall.com/cards/named?format=image&exact=";

export default class Card {
  name: string;
  private normalizedName: string;
  private cardImageURI: string;

  constructor(cardName: string) {
    this.name = cardName;
    this.normalizedName = normalizeStringInput(cardName);
    this.cardImageURI =
      CARD_IMAGE_NAMED_BASE_URL + encodeURIComponent(this.name);
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

  getScryfallImageUrl(version?: string): string {
    let src = this.cardImageURI;

    if (version) {
      src = `${src}&version=${version}`;
    }

    return src;
  }

  toString(): string {
    return this.name;
  }
}
