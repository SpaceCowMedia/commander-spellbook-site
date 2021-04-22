import scryfall from "scryfall-client";
import normalizeStringInput from "../normalize-string-input";
import getExternalCardData, {
  ExternalCardData,
} from "../../get-external-card-data";

export default class Card {
  name: string;
  externalData: ExternalCardData;
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

  toString(): string {
    return this.name;
  }
}
