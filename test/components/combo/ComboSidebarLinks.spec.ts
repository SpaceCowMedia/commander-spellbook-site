import { shallowMount, RouterLinkStub } from "@vue/test-utils";
import ComboSidebarLinks from "@/components/combo/ComboSidebarLinks.vue";
import spellbookApi from "commander-spellbook";

import { mocked } from "ts-jest/utils";
import type { VueComponent } from "../../types";

describe("ComboSidebarLinks", () => {
  beforeEach(() => {
    document.execCommand = jest.fn();
  });

  it("creates a copy combo button", async () => {
    const wrapper = shallowMount(ComboSidebarLinks, {
      propsData: {
        comboLink: "https://example.com/combo/3",
      },
    });

    const comboButton = wrapper.find(".combo-button");

    await comboButton.trigger("click");

    expect(document.execCommand).toBeCalledTimes(1);
  });

  it("creates a 'Find Other Combos Using These Cards' button when there are related searches", async () => {
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

    expect(wrapper.find("#has-similiar-combos").exists()).toBe(false);

    await wrapper.setData({
      hasSimiliarCombos: true,
    });

    expect(wrapper.find("#has-similiar-combos").exists()).toBe(true);
    // Will probably need to adjust this if a second NuxtLink gets added to the component
    expect(wrapper.findComponent(RouterLinkStub).props("to")).toContain(
      "/search?q="
    );
  });

  describe("copyComboLink", () => {
    it("selects hidden input and copies it", () => {
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
        },
      });
      const vm = wrapper.vm as VueComponent;

      jest.spyOn(vm.$refs.copyInput, "select");

      vm.copyComboLink();

      expect(vm.$refs.copyInput.select).toBeCalledTimes(1);
      expect(document.execCommand).toBeCalledTimes(1);
      expect(document.execCommand).toBeCalledWith("copy");
    });

    it("shows copy notification", () => {
      jest.useFakeTimers();

      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.showCopyNotification).toBe(false);

      vm.copyComboLink();

      jest.advanceTimersByTime(1000);
      expect(vm.showCopyNotification).toBe(true);

      jest.advanceTimersByTime(1001);
      expect(vm.showCopyNotification).toBe(false);
    });
  });

  describe("lookupSimiliarCombos", () => {
    beforeEach(() => {
      jest.spyOn(spellbookApi, "search").mockResolvedValue({
        combos: [],
        message: "",
        errors: [],
      });
    });

    it("looks up combos that contain the cards in the combo", async () => {
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
          comboId: "fake-id",
          cards: ["card 1", "card 2"],
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.lookupSimiliarCombos();

      expect(spellbookApi.search).toBeCalledTimes(1);
      expect(spellbookApi.search).toBeCalledWith(
        `-id:fake-id card="card 1" card="card 2"`
      );
    });

    it("leaves hasSimiliarCombos as false when no combos return from search", async () => {
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
          comboId: "fake-id",
          cards: ["card 1", "card 2"],
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.lookupSimiliarCombos();

      expect(vm.hasSimiliarCombos).toBe(false);
    });

    it("sets hasSimiliarCombos to true when combos return from search", async () => {
      mocked(spellbookApi.search).mockResolvedValue({
        combos: [spellbookApi.makeFakeCombo()],
        message: "",
        errors: [],
      });

      const wrapper = shallowMount(ComboSidebarLinks, {
        stubs: {
          NuxtLink: true,
        },
        propsData: {
          comboLink: "https://example.com/combo/3",
          id: "fake-id",
          cards: ["card 1", "card 2"],
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.lookupSimiliarCombos();

      expect(vm.hasSimiliarCombos).toBe(true);
    });
  });
});
