import { mount } from "@vue/test-utils";
import TextWithMagicSymbol from "@/components/TextWithMagicSymbol.vue";

describe("TextWithMagicSymbol", () => {
  it("renders text", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "Some text",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(1);
    expect(wrapper.find(".text").element.textContent).toBe("Some text");
    expect(wrapper.findAll(".magic-symbol").length).toBe(0);
  });

  it("renders image", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: ":manar:",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(
      (wrapper.find(".magic-symbol").element as HTMLImageElement).src
    ).toMatch(/R\.svg$/);
  });

  it("renders longer symbols", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: ":manachaos:",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(
      (wrapper.find(".magic-symbol").element as HTMLImageElement).src
    ).toMatch(/CHAOS\.svg$/);
  });

  it("renders cards", () => {
    const CardTooltipStub = {
      template: "<div></div>",
      props: ["cardName"],
    };
    const wrapper = mount(TextWithMagicSymbol, {
      stubs: {
        CardTooltip: CardTooltipStub,
      },
      propsData: {
        cardsInCombo: ["Card Name 1", "Card Name 2"],
        text: "Card Name 1",
      },
    });

    const tooltip = wrapper.findComponent(CardTooltipStub);

    expect(tooltip.props("cardName")).toBe("Card Name 1");
  });

  it("renders text, cards and images together", () => {
    const CardTooltipStub = {
      template: "<div></div>",
      props: ["cardName"],
    };
    const wrapper = mount(TextWithMagicSymbol, {
      stubs: {
        CardTooltip: CardTooltipStub,
      },
      propsData: {
        cardsInCombo: ["Card Name 1", "Card Name 2"],
        text:
          "some words, :manar: and Card Name 1 :manau: some Card Name 2 words",
      },
    });
    const textNodes = wrapper.findAll(".text");
    const imgNodes = wrapper.findAll(".magic-symbol");
    const tooltipNodes = wrapper.findAllComponents(CardTooltipStub);

    expect(textNodes.length).toBe(5);
    expect(imgNodes.length).toBe(2);
    expect(tooltipNodes.length).toBe(2);
    expect(textNodes.at(0).element.textContent).toBe("some words, ");
    expect(textNodes.at(1).element.textContent).toBe(" and ");
    expect(textNodes.at(2).element.textContent).toBe(" ");
    expect(textNodes.at(3).element.textContent).toBe(" some ");
    expect(textNodes.at(4).element.textContent).toBe(" words");
    expect((imgNodes.at(0).element as HTMLImageElement).src).toMatch(/R\.svg$/);
    expect((imgNodes.at(1).element as HTMLImageElement).src).toMatch(/U\.svg$/);
    expect(tooltipNodes.at(0).props("cardName")).toBe("Card Name 1");
    expect(tooltipNodes.at(1).props("cardName")).toBe("Card Name 2");
  });
});
