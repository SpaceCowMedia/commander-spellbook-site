import COLOR_ORDER from "../color-combo-order";

import type { ColorIdentityColors } from "../types";

// this is sorted alphabetically on purpose to make sorting
// the order of the color identity easier
const WUBRG: ColorIdentityColors[] = ["b", "g", "r", "u", "w"];
const COLOR_MAP = COLOR_ORDER.reduce((accum, colorCombo) => {
  accum[[...colorCombo].sort().join("")] = colorCombo;

  return accum;
}, {} as Record<string, ColorIdentityColors[]>);

export default class ColorIdentity {
  private rawString: string;
  colors: ColorIdentityColors[];

  constructor(colors: string) {
    this.rawString = colors;
    this.colors = this.generateColors(colors);
  }

  toJSON(): string {
    return JSON.stringify({
      rawString: this.rawString,
      colors: this.colors,
    });
  }

  private generateColors(colorString: string): ColorIdentityColors[] {
    const colors = WUBRG.filter((color) => {
      return colorString.includes(color);
    }) as ColorIdentityColors[];

    if (colors.length === 0) {
      colors.push("c");
    }

    // if it's 1 color, it's already sorted and we can skip
    // the color sorting operation
    if (colors.length <= 1) {
      return colors;
    }

    const asKey = colors.join("");

    return COLOR_MAP[asKey];
  }

  private isColorless(): boolean {
    return this.colors.length === 1 && this.colors[0] === "c";
  }

  size(): number {
    if (this.isColorless()) {
      return 0;
    }

    return this.colors.length;
  }

  isWithin(colors: ColorIdentityColors[]): boolean {
    if (this.isColorless()) {
      return true;
    }

    return !this.colors.find((color) => !colors.includes(color));
  }

  is(colors: ColorIdentityColors[]): boolean {
    if (this.isColorless()) {
      return colors.length === 0 || (colors.length === 1 && colors[0] === "c");
    }

    if (this.colors.length !== new Set(colors).size) {
      return false;
    }

    return this.isWithin(colors);
  }

  includes(colors: ColorIdentityColors[]): boolean {
    return !colors.find((color) => !this.colors.includes(color));
  }

  toString(): string {
    return this.rawString;
  }
}
