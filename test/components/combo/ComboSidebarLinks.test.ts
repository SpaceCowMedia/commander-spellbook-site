import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import ComboSidebarLinks from "@/components/combo/ComboSidebarLinks.vue";

describe("ComboSidebarLinks", () => {
  it("creates a share this combo section", () => {
    const ShareComboButtonsStub = { template: "<div></div>" };
    const wrapper = shallowMount(ComboSidebarLinks, {
      stubs: {
        ShareComboButtons: ShareComboButtonsStub,
        NuxtLink: true,
      },
      propsData: {
        comboLink: "https://example.com/combo/3",
      },
    });

    expect(wrapper.findComponent(ShareComboButtonsStub).exists()).toBe(true);
  });

  it("creates buy this combo buttons", () => {
    const BuyComboButtonsStub = {
      template: "<div></div>",
      props: ["cards", "tcgplayerPrice", "cardkingdomPrice"],
    };
    const wrapper = shallowMount(ComboSidebarLinks, {
      stubs: {
        BuyComboButtons: BuyComboButtonsStub,
        NuxtLink: true,
      },
      propsData: {
        comboLink: "https://example.com/combo/3",
        comboId: "fake-id",
        cards: ["card 1", "card 2"],
        tcgplayerPrice: "123.45",
        cardkingdomPrice: "67.89",
      },
    });

    expect(wrapper.findComponent(BuyComboButtonsStub).exists()).toBe(true);
    expect(wrapper.findComponent(BuyComboButtonsStub).props("cards")).toEqual([
      "card 1",
      "card 2",
    ]);
    expect(
      wrapper.findComponent(BuyComboButtonsStub).props("tcgplayerPrice")
    ).toBe("123.45");
    expect(
      wrapper.findComponent(BuyComboButtonsStub).props("cardkingdomPrice")
    ).toBe("67.89");
  });

  it("creates a 'Find Other Combos Using These Cards' button when there are related searches", () => {
    const SimiliarCombosButtonStub = { template: "<div></div>" };
    const wrapper = shallowMount(ComboSidebarLinks, {
      stubs: {
        SimiliarCombosButton: SimiliarCombosButtonStub,
        NuxtLink: true,
      },
      propsData: {
        comboLink: "https://example.com/combo/3",
        comboId: "fake-id",
        cards: ["card 1", "card 2"],
      },
    });

    expect(wrapper.findComponent(SimiliarCombosButtonStub).exists()).toBe(true);
  });

  it("creates a 'View on EDHREC' button when there is an EDHREC link", async () => {
    const EdhrecLinkStub = { template: "<div><slot/></div>" };
    const wrapper = shallowMount(ComboSidebarLinks, {
      stubs: {
        EdhrecLink: EdhrecLinkStub,
        NuxtLink: true,
      },
      propsData: {
        comboLink: "https://example.com/combo/3",
        comboId: "fake-id",
        cards: ["card 1", "card 2"],
      },
    });

    expect(wrapper.findComponent(EdhrecLinkStub).exists()).toBe(false);

    await wrapper.setProps({ edhrecLink: "https://edhrec.com/combos/w/123" });

    expect(wrapper.findComponent(EdhrecLinkStub).exists()).toBe(true);
  });

  it("creates a 'Report Error' button", () => {
    const wrapper = shallowMount(ComboSidebarLinks, {
      stubs: {
        NuxtLink: RouterLinkStub,
      },
      propsData: {
        comboLink: "https://example.com/combo/3",
        comboId: "fake-id",
        cards: ["card 1", "card 2"],
      },
    });

    expect(wrapper.findComponent(RouterLinkStub).props("to")).toBe(
      "/report-error?comboId=fake-id"
    );
  });
});
