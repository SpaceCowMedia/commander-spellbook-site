import { shallowMount } from "@vue/test-utils";
import ComboPage from "@/pages/combo/_id.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import getPriceData from "@/lib/api/get-price-data";
import findById from "@/lib/api/find-by-id";
import { mocked } from "ts-jest/utils";

import type { MountOptions, Route, Router, VueComponent } from "../../types";

jest.mock("@/lib/api/find-by-id");
jest.mock("@/lib/api/get-price-data");

describe("ComboPage", () => {
  let options: MountOptions;
  let $route: Route;
  let $router: Router;

  beforeEach(() => {
    $route = {
      params: {
        id: "13",
      },
      query: {},
    };
    $router = {
      push: jest.fn(),
    };
    options = {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        CardHeader: true,
        ComboList: true,
        ColorIdentity: true,
        ComboSidebarLinks: true,
        ComboResults: true,
      },
    };
    mocked(getPriceData).mockResolvedValue({});
  });

  it("starts in loaded false state", () => {
    const wrapper = shallowMount(ComboPage, options);

    expect((wrapper.vm as VueComponent).loaded).toBe(false);
  });

  it("redirects on mount when loaded", () => {
    shallowMount(ComboPage, options);

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith({
      path: "/combo-not-found",
    });
  });

  it("creates a card header component", async () => {
    const CardHeaderStub = {
      template: "<div></div>",
      props: {
        cardsArt: {
          type: Array,
          default() {
            return [];
          },
        },
      },
    };
    // @ts-ignore
    options.stubs.CardHeader = CardHeaderStub;
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      cards: [
        {
          name: "Card 1",
          artUrl: "https://example.com/art-1",
          oracleImageUrl: "https://example.com/card-1",
        },
        {
          name: "Card 2",
          artUrl: "https://example.com/art-2",
          oracleImageUrl: "https://example.com/card-2",
        },
      ],
    });

    expect(wrapper.findComponent(CardHeaderStub).props("cardsArt")).toEqual([
      "https://example.com/art-1",
      "https://example.com/art-2",
    ]);
  });

  it("creates a combo list of the data", async () => {
    const ComboListStub = {
      template: "<div></div>",
      props: ["cardsInCombo", "iterations"],
    };
    // @ts-ignore
    options.stubs.ComboList = ComboListStub;
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      prerequisites: ["pre 1", "pre 2"],
      steps: ["step 1", "step 2"],
      results: ["result 1", "result 2"],
      cards: [
        {
          name: "Card 1",
          artUrl: "https://example.com/art-1",
          oracleImageUrl: "https://example.com/card-1",
        },
        {
          name: "Card 2",
          artUrl: "https://example.com/art-2",
          oracleImageUrl: "https://example.com/card-2",
        },
      ],
    });

    const lists = wrapper.findAllComponents(ComboListStub);

    expect(lists.at(0).props("iterations")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(0).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(1).props("iterations")).toEqual(["pre 1", "pre 2"]);
    expect(lists.at(1).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(2).props("iterations")).toEqual(["step 1", "step 2"]);
    expect(lists.at(2).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(3).props("iterations")).toEqual(["result 1", "result 2"]);
    expect(lists.at(3).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
  });

  it("adds a ColorIdentity component", async () => {
    const ColorIdentityStub = {
      template: "<div></div>",
      props: {
        colors: {
          type: Array,
          default() {
            return [];
          },
        },
      },
    };
    // @ts-ignore
    options.stubs.ColorIdentity = ColorIdentityStub;
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      colorIdentity: ["w", "u"],
    });

    expect(wrapper.findComponent(ColorIdentityStub).props("colors")).toEqual([
      "w",
      "u",
    ]);
  });

  it("includes warning about banned cards if combo contains them", async () => {
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      hasBannedCard: false,
    });

    expect(wrapper.find(".banned-warning").exists()).toBe(false);

    await wrapper.setData({
      hasBannedCard: true,
    });

    expect(wrapper.find(".banned-warning").exists()).toBe(true);
  });

  it("includes warning about previewed cards if combo contains them", async () => {
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      hasPreviewedCard: false,
    });

    expect(wrapper.find(".previewed-warning").exists()).toBe(false);

    await wrapper.setData({
      hasPreviewedCard: true,
    });

    expect(wrapper.find(".previewed-warning").exists()).toBe(true);
  });

  it("looks up combo from page number param", async () => {
    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    mocked(findById).mockResolvedValue(fakeCombo);

    jest.spyOn(fakeCombo.cards[0], "getScryfallImageUrl");
    jest.spyOn(fakeCombo.cards[1], "getScryfallImageUrl");

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13");

    wrapper.setData(data);

    expect(vm.loaded).toBe(true);
    expect(vm.title).toBe("card 1 | card 2");
    expect(vm.subtitle).toBe("");
    expect(vm.prerequisites).toEqual(["1", "2", "3"]);
    expect(vm.steps).toEqual(["1", "2", "3"]);
    expect(vm.results).toEqual(["1", "2", "3"]);
    expect(vm.results).toEqual(["1", "2", "3"]);
    expect(vm.cards).toEqual([
      {
        name: "card 1",
        artUrl: expect.stringMatching("exact=card%201"),
        oracleImageUrl: expect.stringMatching("exact=card%201"),
      },
      {
        name: "card 2",
        artUrl: expect.stringMatching("exact=card%202"),
        oracleImageUrl: expect.stringMatching("exact=card%202"),
      },
    ]);

    expect(fakeCombo.cards[0].getScryfallImageUrl).toBeCalledTimes(2);
    expect(fakeCombo.cards[0].getScryfallImageUrl).nthCalledWith(1, "art_crop");
    expect(fakeCombo.cards[0].getScryfallImageUrl).nthCalledWith(2, "normal");
    expect(fakeCombo.cards[1].getScryfallImageUrl).toBeCalledTimes(2);
    expect(fakeCombo.cards[1].getScryfallImageUrl).nthCalledWith(1, "art_crop");
    expect(fakeCombo.cards[1].getScryfallImageUrl).nthCalledWith(2, "normal");
  });

  it("looks up prices for combo", async () => {
    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    mocked(findById).mockResolvedValue(fakeCombo);
    mocked(getPriceData).mockResolvedValue({
      "card 1": {
        tcgplayer: { price: 123.45 },
        cardkingdom: { price: 67.89 },
      },
      "card 2": {
        tcgplayer: { price: 123.45 },
        cardkingdom: { price: 67.89 },
      },
    });
    const ComboSidebarLinksStub = {
      template: "<div></div>",
      props: ["tcgplayerPrice", "cardkingdomPrice"],
    };
    // @ts-ignore
    options.stubs.ComboSidebarLinks = ComboSidebarLinksStub;

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    await wrapper.setData(data);

    expect(
      wrapper.findComponent(ComboSidebarLinksStub).props("tcgplayerPrice")
    ).toBe("246.90");
    expect(
      wrapper.findComponent(ComboSidebarLinksStub).props("cardkingdomPrice")
    ).toBe("135.78");
  });

  it("does not pass prices if a card is missing from price data", async () => {
    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    mocked(findById).mockResolvedValue(fakeCombo);
    mocked(getPriceData).mockResolvedValue({
      // @ts-ignore
      "card 1": {
        tcgplayer: { price: 123.45 },
      },
      "card 2": {
        tcgplayer: { price: 123.45 },
        cardkingdom: { price: 67.89 },
      },
    });
    const ComboSidebarLinksStub = {
      template: "<div></div>",
      props: ["tcgplayerPrice", "cardkingdomPrice"],
    };
    // @ts-ignore
    options.stubs.ComboSidebarLinks = ComboSidebarLinksStub;

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    await wrapper.setData(data);

    expect(
      wrapper.findComponent(ComboSidebarLinksStub).props("tcgplayerPrice")
    ).toBe("246.90");
    expect(
      wrapper.findComponent(ComboSidebarLinksStub).props("cardkingdomPrice")
    ).toBe("");
  });

  it("passes subtitle when there are more than 3 cards in combo", async () => {
    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2", "card 3", "card 4"],
    });
    mocked(findById).mockResolvedValue(fakeCombo);

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    wrapper.setData(data);

    expect(vm.title).toBe("card 1 | card 2 | card 3");
    expect(vm.subtitle).toBe("(and one other card)");
  });

  it.each`
    numberOfCards | expectedResult
    ${5}          | ${"two"}
    ${6}          | ${"three"}
    ${7}          | ${"four"}
    ${8}          | ${"five"}
    ${9}          | ${"six"}
    ${10}         | ${"seven"}
  `(
    "includes subtitle when number of cards is $numberOfCards",
    async ({ numberOfCards, expectedResult }) => {
      const cards = [];
      let index = 1;
      while (cards.length < numberOfCards) {
        cards.push(`card ${index}`);
        index++;
      }
      const fakeCombo = makeFakeCombo({
        commanderSpellbookId: "13",
        prerequisites: ["1", "2", "3"],
        steps: ["1", "2", "3"],
        results: ["1", "2", "3"],
        colorIdentity: "wbr",
        cards,
      });
      mocked(findById).mockResolvedValue(fakeCombo);

      const wrapper = shallowMount(ComboPage, options);
      const vm = wrapper.vm as VueComponent;

      const data = await vm.$options.asyncData({
        params: {
          id: "13",
        },
      });

      wrapper.setData(data);

      expect(vm.title).toBe("card 1 | card 2 | card 3");
      expect(vm.subtitle).toBe(`(and ${expectedResult} other cards)`);
    }
  );

  it("does not load data from combo when no combos is found for id", async () => {
    mocked(findById).mockRejectedValue(new Error("not found"));

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13");

    expect(data).toBeFalsy();
  });
});
