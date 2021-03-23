import { shallowMount } from "@vue/test-utils";
import ComboSidebarLinks from "@/components/combo/ComboSidebarLinks.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import search from "@/lib/api/search";

import { mocked } from "ts-jest/utils";
import type { VueComponent } from "../../types";

jest.mock("@/lib/api/search");

describe("ComboSidebarLinks", () => {
  beforeEach(() => {
    document.execCommand = jest.fn();
  });

  it("creates a copy combo button", async () => {
    const wrapper = shallowMount(ComboSidebarLinks, {
      propsData: {
        comboLink: "https://example.com/combo/3",
      },
      mocks: {
        $gtag: {
          event: jest.fn(),
        },
      },
    });

    const comboButton = wrapper.find("#copy-combo-button");

    await comboButton.trigger("click");

    expect(document.execCommand).toBeCalledTimes(1);
  });

  it("creates a 'Find Other Combos Using These Cards' button when there are related searches", async () => {
    const wrapper = shallowMount(ComboSidebarLinks, {
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
  });

  describe("copyComboLink", () => {
    it("selects hidden input and copies it", () => {
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
        },
        mocks: {
          $gtag: {
            event: jest.fn(),
          },
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
        mocks: {
          $gtag: {
            event: jest.fn(),
          },
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

    it("sends analytics event for copying combo", () => {
      const eventSpy = jest.fn();

      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboId: "3",
          comboLink: "https://example.com/combo/3",
        },
        mocks: {
          $gtag: {
            event: eventSpy,
          },
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.copyComboLink();

      expect(eventSpy).toBeCalledTimes(1);
      expect(eventSpy).toBeCalledWith("Copy Combo Link Clicked", {
        event_category: "Combo Detail Page Actions",
      });
    });
  });

  describe("lookupSimiliarCombos", () => {
    beforeEach(() => {
      mocked(search).mockResolvedValue({
        combos: [],
        message: "",
        sort: "colors",
        order: "descending",
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

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith(
        `-spellbookid:fake-id card="card 1" card="card 2"`
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
      mocked(search).mockResolvedValue({
        combos: [makeFakeCombo()],
        message: "",
        sort: "colors",
        order: "descending",
        errors: [],
      });

      const wrapper = shallowMount(ComboSidebarLinks, {
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

  describe("goToSimiliarCombos", () => {
    it("reroutes to search page", async () => {
      const pushSpy = jest.fn();
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
          comboId: "fake-id",
          cards: ["card 1", "card 2"],
        },
        mocks: {
          $router: {
            push: pushSpy,
          },
          $gtag: {
            event: jest.fn(),
          },
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.goToSimiliarCombos();

      expect(pushSpy).toBeCalledTimes(1);
      expect(pushSpy).toBeCalledWith({
        path: "/search",
        query: {
          q: `-spellbookid:fake-id card="card 1" card="card 2"`,
        },
      });
    });

    it("sends an analytics event", async () => {
      const eventSpy = jest.fn();
      const wrapper = shallowMount(ComboSidebarLinks, {
        propsData: {
          comboLink: "https://example.com/combo/3",
          comboId: "fake-id",
          cards: ["card 1", "card 2"],
        },
        mocks: {
          $router: {
            push: jest.fn(),
          },
          $gtag: {
            event: eventSpy,
          },
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.goToSimiliarCombos();

      expect(eventSpy).toBeCalledTimes(1);
      expect(eventSpy).toBeCalledWith(
        "Combos Using These Cards Button Clicked",
        {
          event_category: "Combo Detail Page Actions",
        }
      );
    });
  });
});
