import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import ComboHomePage from "@/pages/meta/combos.vue";
import spellbookApi from "commander-spellbook";

import type { VueComponent } from "../../types";

describe("ComboHomePage", () => {
  describe("lookupCombos", () => {
    it("renders links for each combo", async () => {
      const wrapper = shallowMount(ComboHomePage, {
        stubs: {
          NuxtLink: RouterLinkStub,
        },
      });
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(spellbookApi, "getAllCombos").mockResolvedValue([
        spellbookApi.makeFakeCombo({
          cards: ["card 1", "card 2"],
          commanderSpellbookId: "1",
        }),
        spellbookApi.makeFakeCombo({
          cards: ["card 3", "card 4", "card 5", "card 6"],
          commanderSpellbookId: "2",
        }),
        spellbookApi.makeFakeCombo({
          cards: ["card 7", "card 8", "card 9"],
          commanderSpellbookId: "3",
        }),
      ]);

      await vm.lookupCombos();

      const links = wrapper.findAllComponents(RouterLinkStub);

      expect(links.at(0).props("to")).toBe("/combo/1");
      expect(links.at(0).element.textContent).toBe("card 1, card 2");
      expect(links.at(1).props("to")).toBe("/combo/2");
      expect(links.at(1).element.textContent).toBe(
        "card 3, card 4, card 5, card 6"
      );
      expect(links.at(2).props("to")).toBe("/combo/3");
      expect(links.at(2).element.textContent).toBe("card 7, card 8, card 9");
    });
  });
});
