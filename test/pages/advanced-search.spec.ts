import { shallowMount } from "@vue/test-utils";
import AdvancedSearchPage from "@/pages/advanced-search.vue";

import type { Router, VueComponent } from "../types";

describe("AdvancedSearchPage", () => {
  let $router: Router;

  beforeEach(() => {
    $router = {
      push: jest.fn(),
    };
  });

  it("renders a placeholder query until a search term is entered", async () => {
    const wrapper = shallowMount(AdvancedSearchPage, {
      mocks: {
        $router,
      },
      stubs: {
        ArtCircle: true,
        NuxtLink: true,
        MultiSearchInput: true,
      },
    });

    expect(wrapper.find("#search-query span").text()).toContain(
      "(your query will populate here"
    );

    await wrapper.setData({
      cards: [
        {
          value: "cardname",
          operator: ":",
        },
      ],
    });

    expect(wrapper.find("#search-query span").text()).toContain("cardname");
    expect(wrapper.find("#search-query span").text()).not.toContain(
      "(your query will populate here"
    );
  });

  describe("submit", () => {
    it("redirects to search with query based on data", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });

      wrapper.setData({
        cards: [
          {
            value: "cardname",
            operator: ":",
          },
          {
            value: "card 2",
            operator: "=",
          },
          {
            value: "3",
            operator: ">-number",
          },
          {
            value: "card 4",
            operator: "=-exclude",
          },
        ],
        prerequisites: [
          {
            value: "pre 1",
            operator: ":",
          },
          {
            value: "2",
            operator: ">-number",
          },
        ],
        steps: [
          {
            value: "step 1",
            operator: ":",
          },
          {
            value: "3",
            operator: ">-number",
          },
        ],
        results: [
          {
            value: "result 1",
            operator: ":",
          },
          {
            value: "result 2",
            operator: "=",
          },
        ],
        colorIdentity: [
          {
            value: "temur",
            operator: ":",
          },
        ],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `cardname card="card 2" cards>3 -card="card 4" ci:temur pre:"pre 1" prerequisites>2 step:"step 1" steps>3 result:"result 1" result="result 2"`,
        },
      });
    });

    it("ignores data with empty spaces", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [
          { value: "card 1", operator: ":" },
          { value: "", operator: ":" },
          { value: "        ", operator: ":" },
          { value: "card 2", operator: ":" },
        ],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card:"card 1" card:"card 2"`,
        },
      });
    });

    it("uses single quotes when data includes double quotes", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [{ value: 'Card with "symbols"', operator: ":" }],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card:'Card with "symbols"'`,
        },
      });
    });

    it("uses no quotes when data has only alhpanumeric characters", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [{ value: "card123", operator: "=" }],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card=card123`,
        },
      });
    });

    it("uses no key when key is card and there are only alphanumeric characters", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [{ value: "card123", operator: ":" }],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card123`,
        },
      });
    });

    it("adds an s to keys that are not ci (transforms to colors) or pre (transforms to prerequisites) when they are setting a number of the key", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [{ value: "5", operator: ">-number" }],
        colorIdentity: [{ value: "5", operator: ">-number" }],
        prerequisites: [{ value: "5", operator: ">-number" }],
        steps: [{ value: "5", operator: ">-number" }],
        results: [{ value: "5", operator: ">-number" }],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `cards>5 colors>5 prerequisites>5 steps>5 results>5`,
        },
      });
    });

    it("handles exclusion keys", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [{ value: "card 1", operator: ":-exclude" }],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `-card:"card 1"`,
        },
      });
    });

    it("prevents submission if query is empty", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      vm.submit();

      expect($router.push).not.toBeCalled();
      expect(vm.validationError).toBe("No search queries entered.");
    });

    it("prevents submission if query is not empty, but only has blank spaces", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        cards: [
          { value: "", operator: ":" },
          { value: "     ", operator: ":" },
        ],
        results: [{ value: " ", operator: ":" }],
      });

      vm.submit();

      expect($router.push).not.toBeCalled();
      expect(vm.validationError).toBe("No search queries entered.");
    });

    it("prevents submission if query contains both double and single quotes", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;
      wrapper.setData({
        cards: [
          { value: `Card with "symbols" and 'symbols'`, operator: ":" },
          { value: "basic card", operator: ":" },
        ],
      });

      vm.submit();

      expect($router.push).not.toBeCalled();
      expect(vm.validationError).toBe(
        "Check for errors in your search terms before submitting."
      );
    });

    it("prevents submission if query contains non-numeric values for numeric operator", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;
      wrapper.setData({
        cards: [
          { value: "card 1", operator: ":-number" },
          { value: "basic card", operator: ":" },
        ],
      });

      vm.submit();

      expect($router.push).not.toBeCalled();
      expect(vm.validationError).toBe(
        "Check for errors in your search terms before submitting."
      );
    });
  });

  describe("validate", () => {
    it("resets global validation error message", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        validationError: "some error",
      });

      vm.validate();

      expect(vm.validationError).toBe("");
    });

    it("returns true when there is a validation error", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.validate()).toBe(false);

      wrapper.setData({
        cards: [{ value: `' card "`, operator: ":" }],
      });

      expect(vm.validate()).toBe(true);
    });

    it("adds validation error to inputs for mixing quotes", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;
      const cards = [
        { value: `' card 1"`, operator: ":", error: "" },
        { value: " card 2", operator: ":" },
        { value: `' card 3"`, operator: ":" },
        { value: "card with '", operator: ":" },
        { value: 'card with "', operator: ":" },
      ];

      wrapper.setData({
        cards,
      });

      expect(vm.validate()).toBe(true);

      expect(cards[0].error).toBe(
        "Contains both single and double quotes. A card name may only use one kind."
      );
      expect(cards[1].error).toBeFalsy();
      expect(cards[2].error).toBe(
        "Contains both single and double quotes. A card name may only use one kind."
      );
      expect(cards[3].error).toBeFalsy();
      expect(cards[4].error).toBeFalsy();
    });

    it("adds validation error for providing non-numeric values for numeric operators", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;
      const cards = [
        { value: "card 1", operator: ":-number", error: "" },
        { value: "2", operator: ":-number" },
        { value: "3.05", operator: ":-number" },
      ];

      wrapper.setData({
        cards,
      });

      expect(vm.validate()).toBe(true);

      expect(cards[0].error).toBe(
        "Contains a non-integer. Use a full number instead."
      );
      expect(cards[1].error).toBeFalsy();
      expect(cards[2].error).toBe(
        "Contains a non-integer. Use a full number instead."
      );
    });
  });

  describe("addInput", () => {
    it("adds an input at specified index", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        cards: [{ value: "1", operator: "=" }],
      });

      const cardsInput = wrapper.findAllComponents(FakeMultiSearchInput).at(0);

      await cardsInput.vm.$emit("add-input", 0);

      expect(vm.cards[0].value).toBe("1");
      expect(vm.cards[0].operator).toBe("=");
      expect(vm.cards[1].value).toBe("");
      expect(vm.cards[1].operator).toBe(":");

      wrapper.setData({
        cards: [
          { value: "1", operator: "=" },
          { value: "2", operator: ">" },
          { value: "3", operator: "<" },
        ],
      });

      await cardsInput.vm.$emit("add-input", 1);

      expect(vm.cards[0].value).toBe("1");
      expect(vm.cards[0].operator).toBe("=");
      expect(vm.cards[1].value).toBe("2");
      expect(vm.cards[1].operator).toBe(">");
      expect(vm.cards[2].value).toBe("");
      expect(vm.cards[2].operator).toBe(":");
      expect(vm.cards[3].value).toBe("3");
      expect(vm.cards[3].operator).toBe("<");
    });
  });

  describe("removeInput", () => {
    it("removes an input at specified index", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ArtCircle: true,
          NuxtLink: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        cards: [
          { value: "1", operator: "=" },
          { value: "2", operator: ">" },
          { value: "3", operator: "<" },
        ],
      });

      const cardsInput = wrapper.findAllComponents(FakeMultiSearchInput).at(0);

      await cardsInput.vm.$emit("remove-input", 1);

      expect(vm.cards[0].value).toBe("1");
      expect(vm.cards[0].operator).toBe("=");
      expect(vm.cards[1].value).toBe("3");
      expect(vm.cards[1].operator).toBe("<");
    });
  });
});
