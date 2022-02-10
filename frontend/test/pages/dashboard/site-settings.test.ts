import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import scryfall from "scryfall-client";

import { createFirebase } from "@/test/utils";
import type { Firebase, VueComponent } from "@/test/types";
import SiteSettings from "@/pages/dashboard/site-settings.vue";

jest.mock("scryfall-client");

describe("SiteSettings", () => {
  let $api: jest.SpyInstance;

  beforeEach(() => {
    const methods = (SiteSettings as VueComponent).options.methods;

    // these all get called in the `mounted` hook, so we basically
    // short circut it so these don't actually get called
    jest.spyOn(methods, "fetchMagicSets").mockResolvedValue({});
    jest.spyOn(methods, "fetchCurrentFeaturedRules").mockResolvedValue({});
    jest
      .spyOn(methods, "populateSetCodeAutocompleteOptions")
      .mockImplementation();
  });

  describe("mounting", () => {
    it("sets up data on mount", async () => {
      shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });

      // let the async stuff finish so populateSetCodeAutocompleteOptions
      // can be called
      await flushPromises();

      const methods = (SiteSettings as VueComponent).options.methods;
      expect(methods.fetchMagicSets).toBeCalledTimes(1);
      expect(methods.fetchCurrentFeaturedRules).toBeCalledTimes(1);
      expect(methods.populateSetCodeAutocompleteOptions).toBeCalledTimes(1);
    });

    describe("fetchCurrentFeaturedRules", () => {
      let $fire: Firebase;

      beforeEach(() => {
        $fire = createFirebase();
        $fire.firestore.getDoc.mockResolvedValue({
          buttonText: "button",
          rules: [{ kind: "card", setCode: "dom" }],
        });
        (
          SiteSettings as VueComponent
        ).options.methods.fetchCurrentFeaturedRules.mockRestore();
      });

      it("fetches featured combos from site settings", async () => {
        const wrapper = shallowMount(SiteSettings, {
          mocks: {
            $fire,
          },
        });
        wrapper.vm as VueComponent;

        await flushPromises();

        expect($fire.firestore.getDoc).toBeCalledTimes(1);
        expect($fire.firestore.getDoc).toBeCalledWith(
          "site-settings",
          "featured-combos"
        );
      });

      it("sets button text from featured combos settings", async () => {
        const wrapper = shallowMount(SiteSettings, {
          mocks: {
            $fire,
          },
        });
        const vm = wrapper.vm as VueComponent;

        await flushPromises();

        expect(vm.buttonText).toBe("button");
      });

      it("sets rules from featured combos settings", async () => {
        const wrapper = shallowMount(SiteSettings, {
          mocks: {
            $fire,
          },
        });
        const vm = wrapper.vm as VueComponent;

        await flushPromises();

        expect(vm.setCodes).toEqual([{ value: "dom" }]);
      });
    });

    describe("fetchMagicSets", () => {
      beforeEach(() => {
        (
          SiteSettings as VueComponent
        ).options.methods.fetchMagicSets.mockRestore();
      });

      it("pulls sets from Scryfall", async () => {
        // @ts-ignore
        jest.mocked(scryfall.getSets).mockResolvedValue([
          {
            code: "dom",
            name: "Dominaria",
          },
        ]);

        const wrapper = shallowMount(SiteSettings);
        const vm = wrapper.vm as VueComponent;

        await flushPromises();

        expect(vm.setData).toEqual([{ code: "dom", name: "Dominaria" }]);
      });

      it("filters out irrelevant sets", async () => {
        // @ts-ignore
        jest.mocked(scryfall.getSets).mockResolvedValue([
          {
            code: "digital",
            name: "digital",
            digital: true,
          },
          {
            code: "token",
            name: "token",
            set_type: "token",
          },
          {
            code: "dom",
            name: "Dominaria",
          },
          {
            code: "memorabilia",
            name: "memorabilia",
            set_type: "memorabilia",
          },
          {
            code: "promo",
            name: "promo",
            set_type: "promo",
          },
        ]);

        const wrapper = shallowMount(SiteSettings);
        const vm = wrapper.vm as VueComponent;

        await flushPromises();

        expect(vm.setData).toEqual([{ code: "dom", name: "Dominaria" }]);
      });
    });

    describe("populateSetCodeAutocompleteOptions", () => {
      beforeEach(() => {
        (
          SiteSettings as VueComponent
        ).options.methods.populateSetCodeAutocompleteOptions.mockRestore();
      });

      it("sets autocomplete data", async () => {
        const wrapper = shallowMount(SiteSettings);
        const vm = wrapper.vm as VueComponent;

        await wrapper.setData({
          setData: [{ code: "dom", name: "Dominaria" }],
        });

        vm.populateSetCodeAutocompleteOptions();

        expect(vm.setCodeAutocompleteOptions).toEqual([
          { value: "dom", label: "Dominaria (dom)" },
        ]);
      });
    });
  });

  describe("updateFeaturedCombos", () => {
    beforeEach(() => {
      $api = jest.fn().mockResolvedValue({});
    });

    it("resets error message", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        featuredError: "error",
      });

      await vm.updateFeaturedCombos();

      expect(vm.featuredError).toBe("");
    });

    it("resets info message", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        featuredInfo: "info",
      });

      // set the api call to fail so the featuredInfo success message
      // does not get populated
      $api.mockRejectedValue(new Error("error"));

      await vm.updateFeaturedCombos();

      expect(vm.featuredInfo).toBe("");
    });

    it("sends api call to update the featured combos", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        buttonText: "text",
        setCodes: [{ value: "dom" }, { value: "cmr" }],
      });
      await vm.updateFeaturedCombos();

      expect($api).toBeCalledTimes(1);
      expect($api).toBeCalledWith("/site-settings/update-featured", {
        buttonText: "text",
        rules: [
          { kind: "card", setCode: "dom" },
          { kind: "card", setCode: "cmr" },
        ],
      });
    });

    it("updates featured info on resolution", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await vm.updateFeaturedCombos();

      expect(vm.featuredInfo).toBe(
        "Rules for what combos to feature have been updated. They will go into effect the next time the site deploys (roughly every 2 hours)."
      );
    });

    it("sets error on failure", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        featuredInfo: "info",
      });

      $api.mockRejectedValue(new Error("error"));

      await vm.updateFeaturedCombos();

      expect(vm.featuredError).toBe("error");
    });
  });

  describe("addSetCodeRule", () => {
    it("adds to set code rules with blank option", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.setCodes).toEqual([{ value: "" }]);

      vm.addSetCodeRule(0);

      expect(vm.setCodes).toEqual([{ value: "" }, { value: "" }]);

      await wrapper.setData({
        setCodes: [{ value: "dom" }, { value: "cmr" }, { value: "kld" }],
      });

      vm.addSetCodeRule(1);

      expect(vm.setCodes).toEqual([
        { value: "dom" },
        { value: "cmr" },
        { value: "" },
        { value: "kld" },
      ]);
    });
  });

  describe("removeSetCodeRule", () => {
    it("removes set code form position", async () => {
      const wrapper = shallowMount(SiteSettings, {
        mocks: {
          $api,
        },
      });
      const vm = wrapper.vm as VueComponent;

      await wrapper.setData({
        setCodes: [{ value: "dom" }, { value: "cmr" }, { value: "kld" }],
      });

      vm.removeSetCodeRule(2);

      expect(vm.setCodes).toEqual([{ value: "dom" }, { value: "cmr" }]);

      vm.removeSetCodeRule(0);

      expect(vm.setCodes).toEqual([{ value: "cmr" }]);
    });
  });
});
