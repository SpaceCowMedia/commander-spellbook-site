import { shallowMount } from "@vue/test-utils";

import flushPromises from "flush-promises";
import ComboFinderPage from "@/pages/combo-finder.vue";
import makeFakeCombo from "~/lib/api/make-fake-combo";
import { pluralize as $pluralize } from "@/plugins/text-helpers";
import {
  findCombosFromDecklist,
  convertDecklistToDeck,
} from "@/lib/decklist-parser";

import type { MountOptions, VueComponent } from "@/test/types";

jest.mock("@/lib/decklist-parser");

const LOCAL_STORAGE_DECK_STORAGE_KEY =
  "commander-spellbook-combo-finder-last-decklist";

describe("ComboFinderPage", () => {
  let options: MountOptions;

  beforeEach(() => {
    options = {
      stubs: {},
      mocks: {
        $pluralize,
      },
    };
  });

  afterEach(() => {
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
  });

  describe("saved decklist", () => {
    it("loads decklist saved in localstorage", async () => {
      localStorage.setItem(
        LOCAL_STORAGE_DECK_STORAGE_KEY,
        "Card Foo\nCard Bar"
      );

      const spy = jest
        .spyOn(
          (ComboFinderPage as VueComponent).options.methods,
          "lookupCombos"
        )
        .mockResolvedValue(null);

      const wrapper = shallowMount(ComboFinderPage, options);

      await flushPromises();

      expect(
        (wrapper.find("textarea").element as HTMLTextAreaElement).value
      ).toBe("Card Foo\nCard Bar");

      expect(spy).toBeCalledTimes(1);
    });

    it("does not load decklist saved in localstorage if it is empty space", async () => {
      localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, "     ");

      const wrapper = shallowMount(ComboFinderPage, options);

      await flushPromises();

      expect(
        (wrapper.find("textarea").element as HTMLTextAreaElement).value
      ).toBe("");
    });
  });

  describe("deck count element", () => {
    it("hides deck count when no decklist is available", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      expect(wrapper.find("#decklist-card-count").exists()).toBe(false);

      await wrapper.setData({
        decklist: "foo\nbar\nbaz",
      });

      expect(wrapper.find("#decklist-card-count").exists()).toBe(true);
    });

    it("shows deck count", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "data",
        numberOfCardsInDeck: 3,
      });

      expect(wrapper.find("#decklist-card-count").text()).toBe("3 cards");

      await wrapper.setData({
        numberOfCardsInDeck: 0,
      });

      expect(wrapper.find("#decklist-card-count").text()).toBe("0 cards");

      await wrapper.setData({
        numberOfCardsInDeck: 1,
      });

      expect(wrapper.find("#decklist-card-count").text()).toBe("1 card");
    });
  });

  describe("clear decklist button", () => {
    it("hides when no decklist is available", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      expect(wrapper.find("#clear-decklist-input").exists()).toBe(false);

      await wrapper.setData({
        decklist: "foo\nbar",
      });

      expect(wrapper.find("#clear-decklist-input").exists()).toBe(true);
    });

    it("clears decklist when clicked", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "foo\nbar",
      });

      await wrapper.find("#clear-decklist-input").trigger("click");

      expect(
        (wrapper.find("#decklistInput").element as HTMLTextAreaElement).value
      ).toBe("");
    });

    it("clears localStorage when clicked", async () => {
      // got to prevent it from attempting to lookup combos from value in localStorage
      jest
        .spyOn(
          (ComboFinderPage as VueComponent).options.methods,
          "lookupCombos"
        )
        .mockResolvedValue(null);

      localStorage.setItem(
        LOCAL_STORAGE_DECK_STORAGE_KEY,
        "Card Foo\nCard Bar"
      );

      const wrapper = shallowMount(ComboFinderPage, options);

      await flushPromises();

      await wrapper.find("#clear-decklist-input").trigger("click");

      expect(localStorage.getItem(LOCAL_STORAGE_DECK_STORAGE_KEY)).toBeFalsy();
    });
  });

  describe("hint box", () => {
    it("hides when decklist becomes available", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      expect(wrapper.find("#decklist-hint").exists()).toBe(true);

      await wrapper.setData({
        decklist: "foo\nbar",
      });

      expect(wrapper.find("#decklist-hint").exists()).toBe(false);
    });
  });

  describe("combos in deck section", () => {
    it("hides when no decklist is empty", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      expect(wrapper.find("#combos-in-deck-section").exists()).toBe(false);

      await wrapper.setData({
        decklist: "foo\nbar",
      });

      expect(wrapper.find("#combos-in-deck-section").exists()).toBe(true);
    });

    it("updates heading based on number of combos found", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "foo\nbar",
        combosInDeck: [],
      });

      expect(wrapper.find("#combos-in-deck-section h2").text()).toBe(
        "No Combos Found"
      );

      await wrapper.setData({
        combosInDeck: [makeFakeCombo()],
      });

      expect(wrapper.find("#combos-in-deck-section h2").text()).toBe(
        "1 Combo Found"
      );

      await wrapper.setData({
        combosInDeck: [makeFakeCombo(), makeFakeCombo()],
      });

      expect(wrapper.find("#combos-in-deck-section h2").text()).toBe(
        "2 Combos Found"
      );
    });

    it("populates combos", async () => {
      const ComboResults = { template: "<div></div>", props: ["results"] };
      // @ts-ignore
      options.stubs.ComboResults = ComboResults;
      const wrapper = shallowMount(ComboFinderPage, options);

      const combos = [makeFakeCombo(), makeFakeCombo(), makeFakeCombo()];
      await wrapper.setData({
        decklist: "foo",
        combosInDeck: combos,
      });

      const cr = wrapper
        .find("#combos-in-deck-section")
        .findComponent(ComboResults);

      expect(cr.props("results")).toBe(combos);
    });
  });

  describe("potential combos in deck section", () => {
    it("hides when there are no potential combos in deck", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      expect(wrapper.find("#potential-combos-in-deck-section").exists()).toBe(
        false
      );

      await wrapper.setData({
        potentialCombos: [makeFakeCombo()],
      });

      expect(wrapper.find("#potential-combos-in-deck-section").exists()).toBe(
        true
      );
    });

    it("updates heading based on number of combos found", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "foo\nbar",
        combosInDeck: [],
        potentialCombos: [],
      });

      expect(wrapper.find("#potential-combos-in-deck-section").exists()).toBe(
        false
      );

      await wrapper.setData({
        potentialCombos: [makeFakeCombo()],
      });

      expect(wrapper.find("#potential-combos-in-deck-section h2").text()).toBe(
        "1 Potential Combo Found"
      );

      await wrapper.setData({
        potentialCombos: [makeFakeCombo(), makeFakeCombo()],
      });

      expect(wrapper.find("#potential-combos-in-deck-section h2").text()).toBe(
        "2 Potential Combos Found"
      );
    });

    it("populates combos", async () => {
      const ComboResults = { template: "<div></div>", props: ["results"] };
      // @ts-ignore
      options.stubs.ComboResults = ComboResults;
      const wrapper = shallowMount(ComboFinderPage, options);

      const combos = [makeFakeCombo(), makeFakeCombo(), makeFakeCombo()];
      await wrapper.setData({
        decklist: "foo",
        potentialCombos: combos,
      });

      const cr = wrapper
        .find("#potential-combos-in-deck-section")
        .findComponent(ComboResults);

      expect(cr.props("results")).toBe(combos);
    });
  });

  describe("lookupCombos", () => {
    it("does not lookup combos when decklist only contains one card", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "Card 1",
      });

      jest.mocked(convertDecklistToDeck).mockReturnValue({
        cards: ["Card 1"],
        numberOfCards: 1,
      });

      await (wrapper.vm as VueComponent).lookupCombos();

      expect(convertDecklistToDeck).toBeCalledTimes(1);
      expect(convertDecklistToDeck).toBeCalledWith("Card 1");

      expect(findCombosFromDecklist).not.toBeCalled();
    });

    it("resets combos in deck and potential combos", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "Card 1",
        combosInDeck: [makeFakeCombo(), makeFakeCombo()],
        potentialCombos: [makeFakeCombo(), makeFakeCombo()],
      });

      jest.mocked(convertDecklistToDeck).mockReturnValue({
        cards: ["Card 1"],
        numberOfCards: 1,
      });

      const vm = wrapper.vm as VueComponent;

      await vm.lookupCombos();

      expect(vm.combosInDeck).toEqual([]);
      expect(vm.potentialCombos).toEqual([]);
    });

    it("looks up and populates combos", async () => {
      const wrapper = shallowMount(ComboFinderPage, options);

      await wrapper.setData({
        decklist: "Card 1\nCard 2",
        combosInDeck: [],
        potentialCombos: [],
      });

      jest.mocked(convertDecklistToDeck).mockReturnValue({
        cards: ["Card 1", "Card 2"],
        numberOfCards: 2,
      });

      const combosInDecklist = [makeFakeCombo(), makeFakeCombo()];
      const potentialCombos = [makeFakeCombo(), makeFakeCombo()];

      jest.mocked(findCombosFromDecklist).mockResolvedValue({
        combosInDecklist,
        potentialCombos,
      });

      const vm = wrapper.vm as VueComponent;

      await vm.lookupCombos();

      expect(findCombosFromDecklist).toBeCalledTimes(1);
      expect(findCombosFromDecklist).toBeCalledWith(["Card 1", "Card 2"]);

      expect(vm.combosInDeck).toBe(combosInDecklist);
      expect(vm.potentialCombos).toBe(potentialCombos);
    });
  });
});
