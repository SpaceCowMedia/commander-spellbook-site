import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import type { MountOptions } from "@/test/types";
import ComboResults from "@/components/search/ComboResults.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import { pluralize as $pluralize } from "@/plugins/text-helpers";

describe("ComboResults", () => {
  let options: MountOptions;

  beforeEach(() => {
    options = {
      mocks: {
        $pluralize,
      },
      stubs: {
        NuxtLink: RouterLinkStub,
        ColorIdentity: true,
        CardTooltip: true,
      },
      propsData: {
        results: [
          makeFakeCombo({
            cards: ["card a", "card b", "card c"],
            prerequisites: ["1"],
            steps: ["1"],
            commanderSpellbookId: "1",
            results: ["result 1", "result 2"],
            colorIdentity: "wbr",
            price: 1,
          }),
          makeFakeCombo({
            cards: ["card d", "card e", "card f", "card g"],
            prerequisites: ["1", "2"],
            steps: ["1", "2"],
            commanderSpellbookId: "2",
            results: ["result 3", "result 4"],
            colorIdentity: "gu",
            price: 2,
          }),
          makeFakeCombo({
            cards: ["card h", "card i"],
            prerequisites: ["1", "2", "3"],
            steps: ["1", "2", "3"],
            commanderSpellbookId: "3",
            results: ["result 5", "result 6"],
            colorIdentity: "c",
            price: 0,
          }),
        ],
      },
    };
  });

  it("creates a link for each combo result", () => {
    const wrapper = shallowMount(ComboResults, options);

    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.length).toBe(3);
    expect(links.at(0).props("to")).toBe("/combo/1/");
    expect(links.at(1).props("to")).toBe("/combo/2/");
    expect(links.at(2).props("to")).toBe("/combo/3/");
  });

  it("creates a card tooltip for each name", () => {
    const CardTooltipStub = {
      template: "<div><slot /></div>",
    };
    // @ts-ignore
    options.stubs.CardTooltip = CardTooltipStub;
    const wrapper = shallowMount(ComboResults, options);

    const links = wrapper.findAllComponents(RouterLinkStub);
    const firstCardTooltips = links.at(0).findAllComponents(CardTooltipStub);
    const secondCardTooltips = links.at(1).findAllComponents(CardTooltipStub);
    const thirdCardTooltips = links.at(2).findAllComponents(CardTooltipStub);

    expect(firstCardTooltips.length).toBe(3);
    expect(
      firstCardTooltips.at(0).find(".card-name").element.textContent
    ).toContain("card a");
    expect(
      firstCardTooltips.at(1).find(".card-name").element.textContent
    ).toContain("card b");
    expect(
      firstCardTooltips.at(2).find(".card-name").element.textContent
    ).toContain("card c");
    expect(secondCardTooltips.length).toBe(4);
    expect(
      secondCardTooltips.at(0).find(".card-name").element.textContent
    ).toContain("card d");
    expect(
      secondCardTooltips.at(1).find(".card-name").element.textContent
    ).toContain("card e");
    expect(
      secondCardTooltips.at(2).find(".card-name").element.textContent
    ).toContain("card f");
    expect(
      secondCardTooltips.at(3).find(".card-name").element.textContent
    ).toContain("card g");
    expect(thirdCardTooltips.length).toBe(2);
    expect(
      thirdCardTooltips.at(0).find(".card-name").element.textContent
    ).toContain("card h");
    expect(
      thirdCardTooltips.at(1).find(".card-name").element.textContent
    ).toContain("card i");
  });

  it("prints results for each combo", () => {
    const TextWithMagicSymbolStub = {
      template: "<div></div>",
      props: ["text"],
    };
    // @ts-ignore
    options.stubs.TextWithMagicSymbol = TextWithMagicSymbolStub;
    const wrapper = shallowMount(ComboResults, options);

    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(
      links.at(0).findAllComponents(TextWithMagicSymbolStub).at(0).props("text")
    ).toContain("result 1");
    expect(
      links.at(0).findAllComponents(TextWithMagicSymbolStub).at(1).props("text")
    ).toContain("result 2");
    expect(
      links.at(1).findAllComponents(TextWithMagicSymbolStub).at(0).props("text")
    ).toContain("result 3");
    expect(
      links.at(1).findAllComponents(TextWithMagicSymbolStub).at(1).props("text")
    ).toContain("result 4");
    expect(
      links.at(2).findAllComponents(TextWithMagicSymbolStub).at(0).props("text")
    ).toContain("result 5");
    expect(
      links.at(2).findAllComponents(TextWithMagicSymbolStub).at(1).props("text")
    ).toContain("result 6");
  });

  it("prints the color identity", () => {
    const CIStub = {
      template: "<div></div>",
      props: {
        colors: {
          type: Array,
          default: [],
        },
      },
    };
    // @ts-ignore
    options.stubs.ColorIdentity = CIStub;
    const wrapper = shallowMount(ComboResults, options);

    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).findComponent(CIStub).props("colors")).toEqual([
      "r",
      "w",
      "b",
    ]);
    expect(links.at(1).findComponent(CIStub).props("colors")).toEqual([
      "g",
      "u",
    ]);
    expect(links.at(2).findComponent(CIStub).props("colors")).toEqual(["c"]);
  });

  it("does not include sort footer when no sort option is provided", () => {
    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").exists()).toBe(false);
    expect(links.at(1).find(".sort-footer").exists()).toBe(false);
    expect(links.at(2).find(".sort-footer").exists()).toBe(false);
  });

  it("does not include sort footer when colors is used for sort option", () => {
    // @ts-ignore
    options.propsData.sort = "colors";

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").exists()).toBe(false);
    expect(links.at(1).find(".sort-footer").exists()).toBe(false);
    expect(links.at(2).find(".sort-footer").exists()).toBe(false);
  });

  it("prints the number of decks on EDHREC when sort option is popularity", () => {
    // @ts-ignore
    options.propsData.results[0].numberOfEDHRECDecks = 14;
    // @ts-ignore
    options.propsData.results[1].numberOfEDHRECDecks = 0;
    // @ts-ignore
    options.propsData.results[2].numberOfEDHRECDecks = 1;
    // @ts-ignore
    options.propsData.sort = "popularity";

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain(
      "14 decks (EDHREC)"
    );
    expect(links.at(1).find(".sort-footer").text()).toContain(
      "No deck data (EDHREC)"
    );
    expect(links.at(2).find(".sort-footer").text()).toContain(
      "1 deck (EDHREC)"
    );
  });

  it("prints the number of prerequisites on when sort option is prerequisites", () => {
    // @ts-ignore
    options.propsData.sort = "prerequisites";

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain("1 prerequisite");
    expect(links.at(1).find(".sort-footer").text()).toContain(
      "2 prerequisites"
    );
    expect(links.at(2).find(".sort-footer").text()).toContain(
      "3 prerequisites"
    );
  });

  it("prints the number of steps on when sort option is steps", () => {
    // @ts-ignore
    options.propsData.sort = "steps";

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain("1 step");
    expect(links.at(1).find(".sort-footer").text()).toContain("2 steps");
    expect(links.at(2).find(".sort-footer").text()).toContain("3 steps");
  });

  it("prints the number of results on when sort option is results", () => {
    // @ts-ignore
    options.propsData.sort = "results";
    // @ts-ignore
    options.propsData.results[0].results.pop();

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain("1 result");
    expect(links.at(1).find(".sort-footer").text()).toContain("2 results");
    expect(links.at(2).find(".sort-footer").text()).toContain("2 results");
  });

  it("prints the number of cards on when sort option is cards", () => {
    // @ts-ignore
    options.propsData.sort = "cards";
    // @ts-ignore
    options.propsData.results[2].cards.pop();

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain("3 cards");
    expect(links.at(1).find(".sort-footer").text()).toContain("4 cards");
    expect(links.at(2).find(".sort-footer").text()).toContain("1 card");
  });

  it("prints the number of cards on when sort option is cards", () => {
    // @ts-ignore
    options.propsData.sort = "price";

    const wrapper = shallowMount(ComboResults, options);
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(links.at(0).find(".sort-footer").text()).toContain("$1.00");
    expect(links.at(1).find(".sort-footer").text()).toContain("$2.00");
    expect(links.at(2).find(".sort-footer").text()).toContain(
      "Price Unavailable"
    );
  });

  it("defaults price sort footer to card kingdom as vendor", () => {
    // @ts-ignore
    options.propsData.sort = "price";
    // @ts-ignore
    const priceSpy = jest.spyOn(options.propsData.results[0].cards, "getPrice");

    shallowMount(ComboResults, options);

    expect(priceSpy).toBeCalledWith("cardkingdom");
    expect(priceSpy).not.toBeCalledWith("tcgplayer");
  });

  it("can specify vendor as tcgplayer for  price sort footer", () => {
    // @ts-ignore
    options.propsData.sort = "price";
    // @ts-ignore
    options.propsData.vendor = "tcgplayer";
    // @ts-ignore
    const priceSpy = jest.spyOn(options.propsData.results[0].cards, "getPrice");

    shallowMount(ComboResults, options);

    expect(priceSpy).toBeCalledWith("tcgplayer");
    expect(priceSpy).not.toBeCalledWith("cardkingdom");
  });
});
