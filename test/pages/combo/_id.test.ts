import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import type { MountOptions, Route, Router, VueComponent } from "../../types";
import ComboPage from "@/pages/combo/_id.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import findById from "@/lib/api/find-by-id";
import getExternalCardData from "@/lib/get-external-card-data";

jest.mock("@/lib/api/find-by-id");
jest.mock("@/lib/get-external-card-data");

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
      data() {
        return {
          loaded: true,
        };
      },
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
    jest.mocked(getExternalCardData).mockReturnValue({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
      edhrecLink: "https://edhrec.com/card",
    });
  });

  it("does not attempt to find combo by id when state is already marked as loaded", () => {
    shallowMount(ComboPage, options);

    expect(findById).not.toBeCalled();
  });

  it("redirects on mount when loading state is false and client side lookup to Google Sheets data fails", async () => {
    jest.mocked(findById).mockRejectedValue(new Error("foo"));
    // remove the loaded: true supplied by asyncData
    // @ts-ignore
    delete options.data;
    shallowMount(ComboPage, options);

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13", true);

    // allow findById call to finish
    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith({
      path: "/combo-not-found/",
    });
  });

  it("redirects on mount when preview query param is inlcluded and client side lookup to Google Sheets data fails", async () => {
    jest.mocked(findById).mockRejectedValue(new Error("foo"));
    $route.query.preview = "true";
    shallowMount(ComboPage, options);

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13", true);

    // allow findById call to finish
    await flushPromises();

    expect($router.push).toBeCalledTimes(1);
    expect($router.push).toBeCalledWith({
      path: "/combo-not-found/",
    });
  });

  it("sets data to combo data found on Google Sheets when loaded is not true", async () => {
    jest.mocked(getExternalCardData).mockReturnValue({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 0,
        cardkingdom: 0,
      },
      edhrecLink: "https://edhrec.com/card",
    });
    jest.mocked(findById).mockResolvedValue(
      makeFakeCombo({
        commanderSpellbookId: "13",
        hasBannedCard: true,
        hasSpoiledCard: true,
        cards: ["card 1", "card 2", "card 3"],
        prerequisites: ["pre 1", "pre 2"],
        steps: ["step 1", "step 2"],
        results: ["res 1", "res 2"],
        colorIdentity: "wr",
      })
    );
    // remove the loaded: true supplied by asyncData
    // @ts-ignore
    delete options.data;
    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13", true);

    // allow findById call to finish
    await flushPromises();

    expect($router.push).not.toBeCalled();

    expect(vm.comboNumber).toBe("13");
    expect(vm.hasBannedCard).toBe(true);
    expect(vm.hasPreviewedCard).toBe(true);
    expect(vm.link).toBe("https://commanderspellbook.com/combo/13/");
    expect(vm.cards).toEqual([
      {
        name: "card 1",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
      {
        name: "card 2",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
      {
        name: "card 3",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
    ]);
    expect(vm.prerequisites).toEqual(["pre 1", "pre 2"]);
    expect(vm.steps).toEqual(["step 1", "step 2"]);
    expect(vm.results).toEqual(["res 1", "res 2"]);
    expect(vm.colorIdentity).toEqual(["r", "w"]);
    expect(vm.loaded).toBe(true);
  });

  it("sets data to combo data found on Google Sheets when preview query param is set to true", async () => {
    jest.mocked(findById).mockResolvedValue(
      makeFakeCombo({
        commanderSpellbookId: "13",
        hasBannedCard: true,
        hasSpoiledCard: true,
        cards: ["card 1", "card 2", "card 3"],
        prerequisites: ["pre 1", "pre 2"],
        steps: ["step 1", "step 2"],
        results: ["res 1", "res 2"],
        colorIdentity: "wr",
      })
    );
    $route.query.preview = "true";
    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    expect(findById).toBeCalledTimes(1);
    expect(findById).toBeCalledWith("13", true);

    // allow findById call to finish
    await flushPromises();

    expect($router.push).not.toBeCalled();

    expect(vm.comboNumber).toBe("13");
    expect(vm.hasBannedCard).toBe(true);
    expect(vm.hasPreviewedCard).toBe(true);
    expect(vm.link).toBe("https://commanderspellbook.com/combo/13/");
    expect(vm.cards).toEqual([
      {
        name: "card 1",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
      {
        name: "card 2",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
      {
        name: "card 3",
        artUrl: expect.stringContaining("artcrop.png"),
        oracleImageUrl: expect.stringContaining("oracle.png"),
      },
    ]);
    expect(vm.prerequisites).toEqual(["pre 1", "pre 2"]);
    expect(vm.steps).toEqual(["step 1", "step 2"]);
    expect(vm.results).toEqual(["res 1", "res 2"]);
    expect(vm.colorIdentity).toEqual(["r", "w"]);
    expect(vm.loaded).toBe(true);
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
      numberOfDecks: 14,
    });

    const lists = wrapper.findAllComponents(ComboListStub);

    expect(lists.length).toBe(5);

    expect(lists.at(0).props("iterations")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(0).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(1).props("iterations")).toEqual(["pre 1", "pre 2"]);
    expect(lists.at(1).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(2).props("iterations")).toEqual(["step 1", "step 2"]);
    expect(lists.at(2).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(3).props("iterations")).toEqual(["result 1", "result 2"]);
    expect(lists.at(3).props("cardsInCombo")).toEqual(["Card 1", "Card 2"]);
    expect(lists.at(4).props("iterations")).toEqual([
      "In 14 decks according to EDHREC.",
    ]);
  });

  it("does not include metadata if no metadata info is available", async () => {
    const ComboListStub = {
      template: "<div></div>",
      props: ["title"],
    };
    // @ts-ignore
    options.stubs.ComboList = ComboListStub;
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      numberOfDecks: 0,
    });

    const lists = wrapper.findAllComponents(ComboListStub);

    expect(lists.length).toBe(4);

    expect(lists.at(0).props("title")).toEqual("Cards");
    expect(lists.at(1).props("title")).toEqual("Prerequisites");
    expect(lists.at(2).props("title")).toEqual("Steps");
    expect(lists.at(3).props("title")).toEqual("Results");
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
    jest.mocked(findById).mockResolvedValue(fakeCombo);

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
        artUrl: expect.stringMatching("artcrop.png"),
        oracleImageUrl: expect.stringMatching("oracle.png"),
      },
      {
        name: "card 2",
        artUrl: expect.stringMatching("artcrop.png"),
        oracleImageUrl: expect.stringMatching("oracle.png"),
      },
    ]);
  });

  it("adds edhrec link", async () => {
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
      edhrecLink: "https://edhrec.com/card",
    });
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
      edhrecLink: "https://edhrec.com/card",
    });

    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    jest.mocked(findById).mockResolvedValue(fakeCombo);
    const ComboSidebarLinksStub = {
      template: "<div></div>",
      props: ["edhrecLink"],
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
      wrapper.findComponent(ComboSidebarLinksStub).props("edhrecLink")
    ).toContain("https://edhrec.com/combos/");
  });

  it("looks up prices for combo", async () => {
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
      edhrecLink: "https://edhrec.com/card",
    });
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
      edhrecLink: "https://edhrec.com/card",
    });

    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    jest.mocked(findById).mockResolvedValue(fakeCombo);
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
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 0,
      },
      edhrecLink: "https://edhrec.com/card",
    });
    jest.mocked(getExternalCardData).mockReturnValueOnce({
      isBanned: false,
      isPreview: false,
      isFeatured: false,
      images: {
        artCrop: "https://example.com/artcrop.png",
        oracle: "https://example.com/oracle.png",
      },
      prices: {
        tcgplayer: 123.45,
        cardkingdom: 67.89,
      },
      edhrecLink: "https://edhrec.com/card",
    });

    const fakeCombo = makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    jest.mocked(findById).mockResolvedValue(fakeCombo);
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
    jest.mocked(findById).mockResolvedValue(fakeCombo);

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
      jest.mocked(findById).mockResolvedValue(fakeCombo);

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
    jest.mocked(findById).mockRejectedValue(new Error("not found"));

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
