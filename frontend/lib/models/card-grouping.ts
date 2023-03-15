import type { VendorValue } from "../types";
import Card from "./card";

// based on https://blog.simontest.net/extend-array-with-typescript-965cc1134b3
export default class CardGrouping extends Array<Card> {
  private constructor(items: Card[]) {
    super(...items);
  }

  static create(items?: string[]): CardGrouping {
    const list = Object.create(CardGrouping.prototype);

    if (items) {
      const cards = items.map((item) => new Card(item));
      list.push(...cards);
    }

    return list;
  }

  size(): number {
    return this.length;
  }

  toJSON(): string {
    return JSON.stringify(Array.from(this));
  }

  includesValue(cardName: string): boolean {
    return Boolean(this.find((c) => c.matchesName(cardName)));
  }

  includesValueExactly(cardName: string): boolean {
    return Boolean(this.find((c) => c.matchesNameExactly(cardName)));
  }

  isFeatured(): boolean {
    return Boolean(this.find((c) => c.isFeatured()));
  }

  isBanned(): boolean {
    return Boolean(this.find((c) => c.isBanned()));
  }

  isPreview(): boolean {
    return Boolean(this.find((c) => c.isPreview()));
  }

  getPrice(kind: VendorValue): number {
    let hasNoPrice = false;

    const price = this.reduce((total, card) => {
      const price = card.getPrice(kind);

      if (price <= 0) {
        hasNoPrice = true;
      }

      if (hasNoPrice) {
        return 0;
      }

      return price + total;
    }, 0);

    if (hasNoPrice) {
      return 0;
    }

    return price;
  }

  // if any card doesn't have a price, we assume the combo
  // is not actually available to purchase at that vendor
  // and we return an empty string as the price of the combo
  // (which gets interpretted as not available in the UI)
  getPriceAsString(kind: VendorValue): string {
    const price = this.getPrice(kind);

    if (price <= 0) {
      return "";
    }

    return price.toFixed(2);
  }

  toString(): string {
    return this.join(" | ");
  }

  serialize(): string[] {
    return this.map((card) => card.toString());
  }
}
