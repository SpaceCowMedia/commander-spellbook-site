import { mount } from "@vue/test-utils";
import scryfall from "scryfall-client";

import ColorIdentity from "@/components/ColorIdentity.vue";

jest.mock("scryfall-client");

describe("ColorIdentity", () => {
  it("sets scryfall image src for symbol", () => {
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValueOnce("https://example.com/W.svg");
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValueOnce("https://example.com/B.svg");
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValueOnce("https://example.com/G.svg");

    const wrapper = mount(ColorIdentity, {
      propsData: {
        colors: ["w", "b", "g"],
      },
    });

    const imgs = wrapper.findAll(".color-identity");

    expect((imgs.at(0).element as HTMLImageElement).src).toBe(
      "https://example.com/W.svg"
    );
    expect((imgs.at(1).element as HTMLImageElement).src).toBe(
      "https://example.com/B.svg"
    );
    expect((imgs.at(2).element as HTMLImageElement).src).toBe(
      "https://example.com/G.svg"
    );
  });

  it("sets alt message for each color", () => {
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValue("https://example.com/example.svg");

    const wrapper = mount(ColorIdentity, {
      propsData: {
        colors: ["w", "u", "b", "r", "g", "c", "unknown"],
      },
    });

    const imgs = wrapper.findAll(".color-identity");

    expect((imgs.at(0).element as HTMLImageElement).alt).toBe(
      "White Mana Symbol"
    );
    expect((imgs.at(1).element as HTMLImageElement).alt).toBe(
      "Blue Mana Symbol"
    );
    expect((imgs.at(2).element as HTMLImageElement).alt).toBe(
      "Black Mana Symbol"
    );
    expect((imgs.at(3).element as HTMLImageElement).alt).toBe(
      "Red Mana Symbol"
    );
    expect((imgs.at(4).element as HTMLImageElement).alt).toBe(
      "Green Mana Symbol"
    );
    expect((imgs.at(5).element as HTMLImageElement).alt).toBe(
      "Colorless Mana Symbol"
    );
    expect((imgs.at(6).element as HTMLImageElement).alt).toBe("Mana Symbol");
  });

  it("defaults size to medium", () => {
    const defaultWrapper = mount(ColorIdentity, {
      propsData: {
        colors: ["w"],
      },
    });

    expect(defaultWrapper.props("size")).toBe("medium");
    expect(defaultWrapper.find("img").classes()).toContain("medium");

    const customSizeWrapper = mount(ColorIdentity, {
      propsData: {
        colors: ["w"],
        size: "small",
      },
    });

    expect(customSizeWrapper.props("size")).toBe("small");
    expect(customSizeWrapper.find("img").classes()).toContain("small");
  });
});
