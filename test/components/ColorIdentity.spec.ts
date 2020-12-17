import { mount } from "@vue/test-utils";
import ColorIdentity from "@/components/ColorIdentity.vue";
import scryfall from "scryfall-client";

import { mocked } from "ts-jest/utils";

jest.mock("scryfall-client");

describe("ColorIdentity", () => {
  it("sets scryfall image src for symbol", () => {
    mocked(scryfall.getSymbolUrl).mockReturnValueOnce(
      "https://example.com/W.svg"
    );
    mocked(scryfall.getSymbolUrl).mockReturnValueOnce(
      "https://example.com/B.svg"
    );
    mocked(scryfall.getSymbolUrl).mockReturnValueOnce(
      "https://example.com/G.svg"
    );

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
});