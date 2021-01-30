import { shallowMount } from "@vue/test-utils";
import ComboSidebarLinks from "@/components/combo/ComboSidebarLinks.vue";

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
});
