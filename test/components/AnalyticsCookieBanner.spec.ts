jest.mock("vue-gtag");

import { mount } from "@vue/test-utils";
import AnalyticsCookieBanner from "@/components/AnalyticsCookieBanner.vue";
import type { VueComponent } from "../types";
import { bootstrap } from "vue-gtag";

import { mocked } from "ts-jest/utils";

describe("AnalyticsCookieBanner", () => {
  afterEach(() => {
    localStorage.setItem("GDPR:accepted", "");
  });

  it("sets isOpen to true when GDPR setting has not been set", () => {
    process.browser = true;
    const wrapper = mount(AnalyticsCookieBanner, {
      stubs: {
        NuxtLink: true,
      },
    });
    const vm = wrapper.vm as VueComponent;

    expect(vm.isOpen).toBe(true);
  });

  it("sets isOpen to false when GDPR setting has been set to true", () => {
    process.browser = true;
    localStorage.setItem("GDPR:accepted", "true");
    const wrapper = mount(AnalyticsCookieBanner, {
      stubs: {
        NuxtLink: true,
      },
    });
    const vm = wrapper.vm as VueComponent;

    expect(vm.isOpen).toBe(false);
  });

  it("sets isOpen to false when GDPR setting has been set to false", () => {
    process.browser = true;
    localStorage.setItem("GDPR:accepted", "false");
    const wrapper = mount(AnalyticsCookieBanner, {
      stubs: {
        NuxtLink: true,
      },
    });
    const vm = wrapper.vm as VueComponent;

    expect(vm.isOpen).toBe(false);
  });

  describe("getGDPR", () => {
    it("returns empty string when not in the browser", () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getGDPR()).toBe("");
    });

    it("returns empty string when not set", () => {
      process.browser = true;
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getGDPR()).toBe("");
    });

    it("returns the value when set", () => {
      process.browser = true;
      localStorage.setItem("GDPR:accepted", "false");
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.getGDPR()).toBe("false");
    });
  });

  describe("accept", () => {
    beforeEach(() => {
      // https://www.benmvp.com/blog/mocking-window-location-methods-jest-jsdom/
      const oldWindowLocation = window.location;
      // @ts-ignore
      delete window.location;
      window.location = Object.defineProperties(
        // start with an empty object on which to define properties
        {},
        {
          ...Object.getOwnPropertyDescriptors(oldWindowLocation),
          reload: {
            configurable: true,
            value: jest.fn(),
          },
        }
      );
      mocked(bootstrap).mockResolvedValue({} as any);
    });

    it("bootstraps the vue-gtag module", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.accept();

      expect(bootstrap).toBeCalledTimes(1);
    });

    it("sets GDPR:accepted to true", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(localStorage.getItem("GDPR:accepted")).toBeFalsy();

      await vm.accept();

      expect(localStorage.getItem("GDPR:accepted")).toBe("true");
    });

    it("reloads the page", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.accept();

      expect(location.reload).toBeCalledTimes(1);
    });

    it("closes the banner", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.isOpen).toBe(true);

      await vm.accept();

      expect(vm.isOpen).toBe(false);
    });
  });

  describe("deny", () => {
    beforeEach(() => {
      localStorage.setItem("GDPR:accepted", "");
    });

    it("sets GDPR:accepted to false", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(localStorage.getItem("GDPR:accepted")).toBeFalsy();

      await vm.deny();

      expect(localStorage.getItem("GDPR:accepted")).toBe("false");
    });

    it("closes the banner", async () => {
      const wrapper = mount(AnalyticsCookieBanner, {
        stubs: {
          NuxtLink: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.isOpen).toBe(true);

      await vm.deny();

      expect(vm.isOpen).toBe(false);
    });
  });
});
