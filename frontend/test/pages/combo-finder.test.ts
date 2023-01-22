import { shallowMount } from "@vue/test-utils";

import ComboFinderPage from "@/pages/combo-finder.vue";
import makeFakeCombo from "~/lib/api/make-fake-combo";
import { pluralize as $pluralize } from "@/plugins/text-helpers";

import type { MountOptions } from "@/test/types";

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
});
