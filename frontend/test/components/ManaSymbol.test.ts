import { mount } from "@vue/test-utils";
import scryfall from "scryfall-client";

import ManaSymbol from "@/components/ManaSymbol.vue";

jest.mock("scryfall-client");

describe("ManaSymbol", () => {
  it("sets scryfall image src for symbol", () => {
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValueOnce("https://example.com/W.svg");

    const wrapper = mount(ManaSymbol, {
      propsData: {
        symbol: "w",
      },
    });

    expect((wrapper.element as HTMLImageElement).src).toBe(
      "https://example.com/W.svg"
    );
  });

  it("sets alt message with human readable name for each color", async () => {
    jest
      .mocked(scryfall.getSymbolUrl)
      .mockReturnValue("https://example.com/example.svg");

    const wrapper = mount(ManaSymbol, {
      propsData: {
        symbol: "w",
      },
    });

    expect((wrapper.element as HTMLImageElement).alt).toBe("White Mana Symbol");

    await wrapper.setProps({
      symbol: "u",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe("Blue Mana Symbol");

    await wrapper.setProps({
      symbol: "b",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe("Black Mana Symbol");

    await wrapper.setProps({
      symbol: "r",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe("Red Mana Symbol");

    await wrapper.setProps({
      symbol: "g",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe("Green Mana Symbol");

    await wrapper.setProps({
      symbol: "c",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe(
      "Colorless Mana Symbol"
    );

    await wrapper.setProps({
      symbol: "tap",
    });
    expect((wrapper.element as HTMLImageElement).alt).toBe("Mana Symbol");
  });

  it("defaults size to medium", () => {
    const defaultWrapper = mount(ManaSymbol, {
      propsData: {
        symbol: "w",
      },
    });

    expect(defaultWrapper.props("size")).toBe("medium");
    expect(defaultWrapper.classes()).toContain("medium");

    const customSizeWrapper = mount(ManaSymbol, {
      propsData: {
        symbol: "w",
        size: "small",
      },
    });

    expect(customSizeWrapper.props("size")).toBe("small");
    expect(customSizeWrapper.classes()).toContain("small");
  });
});
