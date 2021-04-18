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

  it("renders image emoji syntax", () => {
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

  it("renders image with Scryfall syntax", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "{r}",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(
      (wrapper.find(".magic-symbol").element as HTMLImageElement).src
    ).toMatch(/R\.svg$/);
  });

  it("renders image with Scryfall syntax for hybrid mana", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "{G/U}",
      },
    });
    expect(wrapper.findAll(".text").length).toBe(0);
    expect(wrapper.findAll(".magic-symbol").length).toBe(1);
    expect(
      (wrapper.find(".magic-symbol").element as HTMLImageElement).src
    ).toMatch(/GU\.svg$/);
  });

  it("renders longer symbols in emoji syntax", () => {
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

  it("renders longer symbols in Scryfall syntax", () => {
    const wrapper = mount(TextWithMagicSymbol, {
      propsData: {
        text: "{chaos}",
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
      template: "<div><slot /></div>",
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
    expect((tooltip.element as HTMLAnchorElement).textContent).toContain(
      "Card Name 1"
    );
  });

  it("renders cards with links", () => {
    const CardTooltipStub = {
      template: "<div><slot /></div>",
      props: ["cardName"],
    };
    const CardLinkStub = {
      template: "<a><slot /></a>",
      props: ["name"],
    };
    const wrapper = mount(TextWithMagicSymbol, {
      stubs: {
        CardTooltip: CardTooltipStub,
        CardLink: CardLinkStub,
      },
      propsData: {
        cardsInCombo: ["Card Name 1", "Card Name 2"],
        includeCardLinks: true,
        text: "Card Name 1",
      },
    });

    const tooltip = wrapper.findComponent(CardTooltipStub);

    expect(tooltip.props("cardName")).toBe("Card Name 1");
    expect(tooltip.findComponent(CardLinkStub).props("name")).toBe(
      "Card Name 1"
    );
    expect(
      (tooltip.findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Card Name 1");
  });

  it("renders cards with links when short names are used", () => {
    const CardTooltipStub = {
      template: "<div><slot /></div>",
      props: ["cardName"],
    };
    const CardLinkStub = {
      template: "<a><slot /></a>",
      props: ["name"],
    };
    const wrapper = mount(TextWithMagicSymbol, {
      stubs: {
        CardTooltip: CardTooltipStub,
        CardLink: CardLinkStub,
      },
      propsData: {
        cardsInCombo: [
          "Bar, Comma Card",
          "Foo The Use of Articles",
          "Baz of something",
          "A Split // Card Here",
          "The Frog Monster",
        ],
        includeCardLinks: true,
        text:
          "Some text that has Bar and also some that has Foo as well and Baz too and A Split some space Card Here as well Frog Monster but not Monster but Frog works",
      },
    });

    const tooltips = wrapper.findAllComponents(CardTooltipStub);

    expect(tooltips.at(0).props("cardName")).toBe("Bar, Comma Card");
    expect(tooltips.at(0).findComponent(CardLinkStub).props("name")).toBe(
      "Bar, Comma Card"
    );
    expect(
      (tooltips.at(0).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Bar");

    expect(tooltips.at(1).props("cardName")).toBe("Foo The Use of Articles");
    expect(tooltips.at(1).findComponent(CardLinkStub).props("name")).toBe(
      "Foo The Use of Articles"
    );
    expect(
      (tooltips.at(1).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Foo");

    expect(tooltips.at(2).props("cardName")).toBe("Baz of something");
    expect(tooltips.at(2).findComponent(CardLinkStub).props("name")).toBe(
      "Baz of something"
    );
    expect(
      (tooltips.at(2).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Baz");

    expect(tooltips.at(3).props("cardName")).toBe("A Split // Card Here");
    expect(tooltips.at(3).findComponent(CardLinkStub).props("name")).toBe(
      "A Split // Card Here"
    );
    expect(
      (tooltips.at(3).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("A Split");

    expect(tooltips.at(4).props("cardName")).toBe("A Split // Card Here");
    expect(tooltips.at(4).findComponent(CardLinkStub).props("name")).toBe(
      "A Split // Card Here"
    );
    expect(
      (tooltips.at(4).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Card Here");

    expect(tooltips.at(5).props("cardName")).toBe("The Frog Monster");
    expect(tooltips.at(5).findComponent(CardLinkStub).props("name")).toBe(
      "The Frog Monster"
    );
    expect(
      (tooltips.at(5).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Frog Monster");

    expect(tooltips.at(6).props("cardName")).toBe("The Frog Monster");
    expect(tooltips.at(6).findComponent(CardLinkStub).props("name")).toBe(
      "The Frog Monster"
    );
    expect(
      (tooltips.at(6).findComponent(CardLinkStub).find("a")
        .element as HTMLAnchorElement).textContent
    ).toBe("Frog");
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
        cardsInCombo: ["Card, Name 1", "Card Name 2"],
        text: "some words, :manar: and Card :manau: some Card Name 2 words",
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
    expect(tooltipNodes.at(0).props("cardName")).toBe("Card, Name 1");
    expect(tooltipNodes.at(1).props("cardName")).toBe("Card Name 2");
  });
});
