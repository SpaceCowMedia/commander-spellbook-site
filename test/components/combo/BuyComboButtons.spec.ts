import { mount, shallowMount } from "@vue/test-utils";
import BuyComboButtons from "@/components/combo/BuyComboButtons.vue";

describe("BuyComboButton", () => {
  it("creates a TCGplayer button", () => {
    const wrapper = mount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        tcgplayerPrice: "40.32",
      },
    });

    const tcgButton = wrapper.find("#tcg-buy-this-combo");

    expect(tcgButton.text()).toContain("TCGplayer");
    expect(tcgButton.attributes("href")).toBe(
      "https://www.tcgplayer.com/massentry?partner=EDHREC&utm_campaign=affiliate&utm_medium=commanderspellbook&utm_source=EDHREC&c=1%20card%201%7C%7C1%20card%202%7C%7C1%20card%203"
    );
    expect(tcgButton.text()).toContain("($40.32)");
  });

  it("disables tcgplayer button if no price", async () => {
    const ExternalLinkStub = {
      template: "<div><slot/></div>",
      props: ["disabled", "to"],
    };
    const wrapper = shallowMount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        tcgplayerPrice: "",
      },
      stubs: {
        ExternalLink: ExternalLinkStub,
      },
    });

    expect(
      wrapper.findAllComponents(ExternalLinkStub).at(0).props("disabled")
    ).toBe(true);
    expect(wrapper.find("#tcg-buy-this-combo").text()).toContain(
      "(Out of Stock)"
    );

    await wrapper.setProps({
      tcgplayerPrice: "40.32",
    });

    expect(
      wrapper.findAllComponents(ExternalLinkStub).at(0).props("disabled")
    ).toBe(false);
    expect(wrapper.find("#tcg-buy-this-combo").text()).not.toContain(
      "(Out of Stock)"
    );
  });

  it("fires a google analytics event when TCGplayer button is clicked", async () => {
    const spy = jest.fn();
    const wrapper = mount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        tcgplayerPrice: "123.45",
      },
      mocks: {
        $gtag: {
          event: spy,
        },
      },
    });

    await wrapper.find("#tcg-buy-this-combo").trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("Buy on TCGplayer button clicked", {
      event_category: "Combo Detail Page Actions",
    });
  });

  it("creates a Card Kingdom button", () => {
    const wrapper = mount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        cardkingdomPrice: "123.45",
      },
    });

    const ckButton = wrapper.find("#ck-buy-this-combo");

    expect(ckButton.text()).toContain("Card Kingdom");
    expect(ckButton.attributes("href")).toBe(
      "https://www.cardkingdom.com/builder?partner=edhrec&utm_source=edhrec&utm_medium=commanderspellbook&utm_campaign=edhrec&c=1%20card%201%0A1%20card%202%0A1%20card%203"
    );
    expect(ckButton.text()).toContain("($123.45)");
  });

  it("fires a google analytics event when Card Kingdom button is clicked", async () => {
    const spy = jest.fn();
    const wrapper = mount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        cardkingdomPrice: "123.45",
      },
      mocks: {
        $gtag: {
          event: spy,
        },
      },
    });

    await wrapper.find("#ck-buy-this-combo").trigger("click");

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("Buy on Card Kingdom button clicked", {
      event_category: "Combo Detail Page Actions",
    });
  });

  it("disables Card Kingdom button if price is not available", async () => {
    const ExternalLinkStub = {
      template: "<div><slot/></div>",
      props: ["disabled", "to"],
    };
    const wrapper = shallowMount(BuyComboButtons, {
      propsData: {
        cards: ["card 1", "card 2", "card 3"],
        cardkingdomPrice: "",
      },
      stubs: {
        ExternalLink: ExternalLinkStub,
      },
    });

    expect(
      wrapper.findAllComponents(ExternalLinkStub).at(1).props("disabled")
    ).toBe(true);
    expect(wrapper.find("#ck-buy-this-combo").text()).toContain(
      "(Out of Stock)"
    );

    await wrapper.setProps({
      cardkingdomPrice: "40.32",
    });

    expect(
      wrapper.findAllComponents(ExternalLinkStub).at(1).props("disabled")
    ).toBe(false);
    expect(wrapper.find("#ck-buy-this-combo").text()).not.toContain(
      "(Out of Stock)"
    );
  });
});
