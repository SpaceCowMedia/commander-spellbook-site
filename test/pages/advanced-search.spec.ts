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

  describe("submit", () => {
    it("redirects to search with query based on data", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });

      wrapper.setData({
        cards: ["card 1", "card 2"],
        prerequisites: ["pre 1", "pre 2"],
        steps: ["step 1", "step 2"],
        results: ["result 1", "result 2"],
        colorIdentity: [
          {
            symbol: "w",
            checked: true,
          },
          {
            symbol: "u",
            checked: false,
          },
        ],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card:"card 1" card:"card 2" ci:w pre:"pre 1" pre:"pre 2" step:"step 1" step:"step 2" result:"result 1" result:"result 2"`,
        },
      });
    });

    it("does not redirect when query is empty", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).not.toBeCalled();
    });

    it("uses coloreless identity when no colors are checked", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        colorIdentity: [
          {
            symbol: "w",
            checked: false,
          },
          {
            symbol: "u",
            checked: false,
          },
          {
            symbol: "b",
            checked: false,
          },
          {
            symbol: "r",
            checked: false,
          },
          {
            symbol: "g",
            checked: false,
          },
        ],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: "ci:colorless",
        },
      });
    });

    it("does not use color identity if all colores are checked", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: ["card 1"],
        colorIdentity: [
          {
            symbol: "w",
            checked: true,
          },
          {
            symbol: "u",
            checked: true,
          },
          {
            symbol: "b",
            checked: true,
          },
          {
            symbol: "r",
            checked: true,
          },
          {
            symbol: "g",
            checked: true,
          },
        ],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card:"card 1"`,
        },
      });
    });

    it("ignores data with empty spaces", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: ["card 1", "", "        ", "card 2"],
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
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: ['Card with "symbols"'],
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

    it("ignores query if it contains both single and double quotes", () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        mocks: {
          $router,
        },
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      wrapper.setData({
        cards: [`Card with "symbols" and 'symbols'`, "basic card"],
      });

      (wrapper.vm as VueComponent).submit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: `card:"basic card"`,
        },
      });
    });
  });

  describe("toggleColorIdentity", () => {
    it("toggles the state of the color identity when clicked", async () => {
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: true,
        },
      });
      const vm = wrapper.vm as VueComponent;

      expect(vm.colorIdentity[0].checked).toBe(true);
      await wrapper.findAll(".color-identity-wrapper").at(0).trigger("click");
      expect(vm.colorIdentity[0].checked).toBe(false);
      await wrapper.findAll(".color-identity-wrapper").at(0).trigger("click");
      expect(vm.colorIdentity[0].checked).toBe(true);

      expect(vm.colorIdentity[2].checked).toBe(true);
      await wrapper.findAll(".color-identity-wrapper").at(2).trigger("click");
      expect(vm.colorIdentity[2].checked).toBe(false);
    });
  });

  describe("updateCards", () => {
    it("is a listener on a multi search input", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });

      const cardsInput = wrapper.findAllComponents(FakeMultiSearchInput).at(0);

      expect(cardsInput.props("label")).toBe("Card Name");

      await cardsInput.vm.$emit("update", {
        index: 1,
        value: "new card",
      });

      expect((wrapper.vm as VueComponent).cards[1]).toBe("new card");
    });
  });

  describe("updatePrerequisites", () => {
    it("is a listener on a multi search input", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });

      const preReqInput = wrapper.findAllComponents(FakeMultiSearchInput).at(1);

      expect(preReqInput.props("label")).toBe("Prerequisite");

      await preReqInput.vm.$emit("update", {
        index: 1,
        value: "new prereq",
      });

      expect((wrapper.vm as VueComponent).prerequisites[1]).toBe("new prereq");
    });
  });

  describe("updateSteps", () => {
    it("is a listener on a multi search input", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });

      const stepInput = wrapper.findAllComponents(FakeMultiSearchInput).at(2);

      expect(stepInput.props("label")).toBe("Step");

      await stepInput.vm.$emit("update", {
        index: 1,
        value: "new step",
      });

      expect((wrapper.vm as VueComponent).steps[1]).toBe("new step");
    });
  });

  describe("updateResults", () => {
    it("is a listener on a multi search input", async () => {
      const FakeMultiSearchInput = {
        template: "<div></div>",
        props: ["label", "placeholder"],
      };
      const wrapper = shallowMount(AdvancedSearchPage, {
        stubs: {
          ColorIdentity: true,
          MultiSearchInput: FakeMultiSearchInput,
        },
      });

      const resultInput = wrapper.findAllComponents(FakeMultiSearchInput).at(3);

      expect(resultInput.props("label")).toBe("Result");

      await resultInput.vm.$emit("update", {
        index: 1,
        value: "new result",
      });

      expect((wrapper.vm as VueComponent).results[1]).toBe("new result");
    });
  });
});
