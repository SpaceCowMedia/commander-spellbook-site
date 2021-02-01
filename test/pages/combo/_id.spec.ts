import { shallowMount } from "@vue/test-utils";
import ComboPage from "@/pages/combo/_id.vue";
import spellbookApi from "commander-spellbook";

import type { MountOptions, Route, Router, VueComponent } from "../../types";

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

  it("includes warning about spoiled cards if combo contains them", async () => {
    const wrapper = shallowMount(ComboPage, options);

    await wrapper.setData({
      hasSpoiledCard: false,
    });

    expect(wrapper.find(".spoiled-warning").exists()).toBe(false);

    await wrapper.setData({
      hasSpoiledCard: true,
    });

    expect(wrapper.find(".spoiled-warning").exists()).toBe(true);
  });

  it("looks up combo from page number param", async () => {
    const fakeCombo = spellbookApi.makeFakeCombo({
      commanderSpellbookId: "13",
      prerequisites: ["1", "2", "3"],
      steps: ["1", "2", "3"],
      results: ["1", "2", "3"],
      colorIdentity: "wbr",
      cards: ["card 1", "card 2"],
    });
    jest.spyOn(spellbookApi, "findById").mockResolvedValue(fakeCombo);

    jest.spyOn(fakeCombo.cards[0], "getScryfallImageUrl");
    jest.spyOn(fakeCombo.cards[1], "getScryfallImageUrl");

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    expect(spellbookApi.findById).toBeCalledTimes(1);
    expect(spellbookApi.findById).toBeCalledWith("13");

    wrapper.setData(data);

    expect(vm.loaded).toBe(true);
    expect(vm.title).toBe("Combo Number 13");
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
    expect(fakeCombo.cards[0].getScryfallImageUrl).nthCalledWith(2);
    expect(fakeCombo.cards[1].getScryfallImageUrl).toBeCalledTimes(2);
    expect(fakeCombo.cards[1].getScryfallImageUrl).nthCalledWith(1, "art_crop");
    expect(fakeCombo.cards[1].getScryfallImageUrl).nthCalledWith(2);
  });

  it("does not load data from combo when no combos is found for id", async () => {
    jest
      .spyOn(spellbookApi, "findById")
      .mockRejectedValue(new Error("not found"));

    const wrapper = shallowMount(ComboPage, options);
    const vm = wrapper.vm as VueComponent;

    const data = await vm.$options.asyncData({
      params: {
        id: "13",
      },
    });

    expect(spellbookApi.findById).toBeCalledTimes(1);
    expect(spellbookApi.findById).toBeCalledWith("13");

    expect(data).toBeFalsy();
  });
});
