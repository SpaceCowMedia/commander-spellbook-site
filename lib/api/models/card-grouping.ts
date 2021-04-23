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

  toString(): string {
    return this.join(" | ");
  }
}
