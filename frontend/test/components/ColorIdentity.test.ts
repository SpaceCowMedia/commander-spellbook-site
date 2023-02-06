import { mount } from "@vue/test-utils";

import ColorIdentity from "@/components/ColorIdentity.vue";

describe("ColorIdentity", () => {
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

  it("creates a mana symbol for each color", () => {
    const ManaSymbol = {
      template: "<div></div>",
      props: ["symbol", "size"],
    };
    const wrapper = mount(ColorIdentity, {
      propsData: {
        colors: ["w", "r", "g"],
      },
      stubs: {
        ManaSymbol,
      },
    });

    const symbols = wrapper.findAllComponents(ManaSymbol);

    expect(symbols).toHaveLength(3);
    expect(symbols.at(0).props("symbol")).toBe("w");
    expect(symbols.at(0).props("size")).toBe("medium");
    expect(symbols.at(1).props("symbol")).toBe("r");
    expect(symbols.at(1).props("size")).toBe("medium");
    expect(symbols.at(2).props("symbol")).toBe("g");
    expect(symbols.at(2).props("size")).toBe("medium");
  });
});
