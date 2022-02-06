import { shallowMount } from "@vue/test-utils";
import type { VueComponent } from "../../types";
import CopyComboLinkButton from "@/components/combo/CopyComboLinkButton.vue";

describe("CopyComboLinkButton", () => {
  beforeEach(() => {
    document.execCommand = jest.fn();
  });

  describe("copyComboLink", () => {
    it("selects hidden input and copies it", () => {
      const wrapper = shallowMount(CopyComboLinkButton, {
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

      const wrapper = shallowMount(CopyComboLinkButton, {
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

      const wrapper = shallowMount(CopyComboLinkButton, {
        propsData: {
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
});
