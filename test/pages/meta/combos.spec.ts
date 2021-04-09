import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import ComboHomePage from "@/pages/meta/combos.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import getAllCombos from "@/lib/api/get-all-combos";
import { mocked } from "ts-jest/utils";

import type { VueComponent } from "../../types";

jest.mock("@/lib/api/get-all-combos");

describe("ComboHomePage", () => {
  describe("lookupCombos", () => {
    it("renders links for each combo", async () => {
      const wrapper = shallowMount(ComboHomePage, {
        stubs: {
          NuxtLink: RouterLinkStub,
        },
      });
      const vm = wrapper.vm as VueComponent;

      mocked(getAllCombos).mockResolvedValue([
        makeFakeCombo({
          cards: ["card 1", "card 2"],
          commanderSpellbookId: "1",
        }),
        makeFakeCombo({
          cards: ["card 3", "card 4", "card 5", "card 6"],
          commanderSpellbookId: "2",
        }),
        makeFakeCombo({
          cards: ["card 7", "card 8", "card 9"],
          commanderSpellbookId: "3",
        }),
      ]);

      await vm.lookupCombos();

      const links = wrapper.findAllComponents(RouterLinkStub);

      expect(links.at(0).props("to")).toBe("/combo/1/");
      expect(links.at(0).element.textContent).toBe("card 1, card 2");
      expect(links.at(1).props("to")).toBe("/combo/2/");
      expect(links.at(1).element.textContent).toBe(
        "card 3, card 4, card 5, card 6"
      );
      expect(links.at(2).props("to")).toBe("/combo/3/");
      expect(links.at(2).element.textContent).toBe("card 7, card 8, card 9");
    });
  });
});
