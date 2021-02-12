import { shallowMount } from "@vue/test-utils";
import SearchPage from "@/pages/search.vue";
import spellbookApi from "commander-spellbook";
import { mocked } from "ts-jest/utils";

import type { MountOptions, Route, Router, VueComponent } from "../types";

describe("SearchPage", () => {
  let $route: Route;
  let $router: Router;
  let wrapperOptions: MountOptions;
  let fakeCombos: {
    names: string[];
    colors: string[];
    results: string[];
    id: string;
  }[];

  beforeEach(() => {
    jest.spyOn(spellbookApi, "search").mockResolvedValue({
      combos: [],
      message: "",
      errors: [],
    });
    fakeCombos = [
      {
        names: ["a", "b", "c"],
        colors: ["w", "b", "r"],
        results: ["result 1", "result 2"],
        id: "1",
      },
      {
        names: ["d", "e", "f"],
        colors: ["u", "g"],
        results: ["result 3", "result 4"],
        id: "2",
      },
    ];
    $route = {
      path: "/search",
      query: {},
    };
    $router = {
      push: jest.fn(),
      replace: jest.fn(),
    };
    wrapperOptions = {
      mocks: {
        $route,
        $router,
      },
      stubs: {
        ComboResults: true,
        SearchMessage: true,
        NoCombosFound: true,
        Pagination: true,
      },
    };
  });

  describe("mounting", () => {
    beforeEach(() => {
      jest
        .spyOn(
          (SearchPage as VueComponent).options.methods,
          "updateSearchResults"
        )
        .mockImplementation(() => {
          return Promise.resolve();
        });
    });

    it("starts in a loading state", () => {
      $route.query.q = "card:sydri";
      const NoCombosStub = {
        template: "<div></div>",
        props: {
          loaded: {
            type: Boolean,
          },
        },
      };
      // @ts-ignore
      wrapperOptions.stubs.NoCombosFound = NoCombosStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      expect(vm.loaded).toBe(false);

      expect(wrapper.findComponent(NoCombosStub).props("loaded")).toBe(false);
    });

    it("shows no combos found when page has loaded but no results are available", async () => {
      const NoCombosStub = {
        template: "<div></div>",
        props: {
          loaded: {
            type: Boolean,
          },
        },
      };
      // @ts-ignore
      wrapperOptions.stubs.NoCombosFound = NoCombosStub;
      mocked(spellbookApi.search).mockResolvedValue({
        combos: [],
        message: "",
        errors: [],
      });

      const wrapper = shallowMount(SearchPage, wrapperOptions);

      // let mounting finish
      await Promise.resolve();

      expect(wrapper.findComponent(NoCombosStub).props("loaded")).toBe(true);
    });

    it("shows combo results when page has loaded and results are available", async () => {
      const NoCombosStub = {
        template: "<div></div>",
      };
      const ComboResultsStub = {
        props: {
          results: {
            type: Array,
          },
        },
        template: "<div></div>",
      };
      // @ts-ignore
      wrapperOptions.stubs.NoCombosFound = NoCombosStub;
      // @ts-ignore
      wrapperOptions.stubs.ComboResults = ComboResultsStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        loaded: true,
        combos: fakeCombos,
      });

      expect(wrapper.findComponent(NoCombosStub).exists()).toBeFalsy();

      const comboResultsNode = wrapper.findComponent(ComboResultsStub);

      expect(comboResultsNode.exists()).toBeTruthy();
      expect(comboResultsNode.props("results")).toEqual([
        {
          names: ["a", "b", "c"],
          colors: ["w", "b", "r"],
          results: ["result 1", "result 2"],
          id: "1",
        },
        {
          names: ["d", "e", "f"],
          colors: ["u", "g"],
          results: ["result 3", "result 4"],
          id: "2",
        },
      ]);
    });

    it("shows search message", async () => {
      const SearchMessageStub = {
        template: "<div></div>",
        props: [
          "message",
          "errors",
          "currentPage",
          "totalPages",
          "maxNumberOfCombosPerPage",
          "totalResults",
        ],
      };
      // @ts-ignore
      wrapperOptions.stubs.SearchMessage = SearchMessageStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      // add a large number of combos
      "x"
        .repeat(213)
        .split("")
        .forEach((value, index) => {
          fakeCombos.push({
            names: [value],
            colors: ["u", "g"],
            results: ["result x", "result y"],
            id: String(index + 2),
          });
        });

      await wrapper.setData({
        loaded: true,
        combos: fakeCombos,
        message: "some message",
        errors: "some errors",
      });

      const searchMessageComponent = wrapper.findComponent(SearchMessageStub);

      expect(searchMessageComponent.props()).toEqual({
        message: "some message",
        errors: "some errors",
        currentPage: 1,
        totalPages: 3,
        maxNumberOfCombosPerPage: 76,
        totalResults: 215,
      });
    });

    it("shows pagination for results", async () => {
      const PaginationStub = {
        template: "<div></div>",
        props: {
          currentPage: Number,
          totalPages: Number,
        },
      };
      // @ts-ignore
      wrapperOptions.stubs.Pagination = PaginationStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      // add a large number of combos
      "x"
        .repeat(213)
        .split("")
        .forEach((value, index) => {
          fakeCombos.push({
            names: [value],
            colors: ["u", "g"],
            results: ["result x", "result y"],
            id: String(index + 2),
          });
        });

      await wrapper.setData({
        loaded: true,
        combos: fakeCombos,
      });

      const paginationComponents = wrapper.findAllComponents(PaginationStub);

      expect(paginationComponents.length).toBe(2);
      expect(paginationComponents.at(0).props()).toEqual({
        currentPage: 1,
        totalPages: 3,
      });
      expect(paginationComponents.at(1).props()).toEqual({
        currentPage: 1,
        totalPages: 3,
      });

      await wrapper.setData({
        page: 2,
      });

      expect(paginationComponents.at(0).props()).toEqual({
        currentPage: 2,
        totalPages: 3,
      });
      expect(paginationComponents.at(1).props()).toEqual({
        currentPage: 2,
        totalPages: 3,
      });
    });

    it("updates search when query param `q` updates", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;
      jest.spyOn(vm, "onQueryChange").mockImplementation();

      vm.$options.watch["$route.query.q"].call(wrapper.vm);

      expect(vm.onQueryChange).toBeCalledTimes(1);
    });

    it("calls goFoward when pagination element emits a goForward event", async () => {
      const forwardSpy = jest
        // @ts-ignore
        .spyOn(SearchPage.options.methods, "goForward")
        .mockImplementation();

      const PaginationStub = {
        template: "<div></div>",
      };
      // @ts-ignore
      wrapperOptions.stubs.Pagination = PaginationStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        loaded: true,
        combos: fakeCombos,
      });

      await wrapper
        .findAllComponents(PaginationStub)
        .at(0)
        .vm.$emit("go-forward");

      expect(forwardSpy).toBeCalledTimes(1);
    });

    it("calls goBack when pagination element emits a goBack event", async () => {
      const forwardSpy = jest
        // @ts-ignore
        .spyOn(SearchPage.options.methods, "goBack")
        .mockImplementation();

      const PaginationStub = {
        template: "<div></div>",
      };
      // @ts-ignore
      wrapperOptions.stubs.Pagination = PaginationStub;
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        loaded: true,
        combos: fakeCombos,
      });

      await wrapper.findAllComponents(PaginationStub).at(0).vm.$emit("go-back");

      expect(forwardSpy).toBeCalledTimes(1);
    });
  });

  describe("parseSearchQuery", () => {
    it("returns an empty string if no query is available", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const query = vm.parseSearchQuery();

      expect(query).toBe("");
    });

    it("returns an empty string if query is not a string", () => {
      // @ts-ignore
      $route.query.q = ["foo", "bar"];

      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const query = vm.parseSearchQuery();

      expect(query).toBe("");
    });

    it("returns query if it exists", () => {
      $route.query.q = "card:Sydri";

      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const query = vm.parseSearchQuery();

      expect(query).toBe("card:Sydri");
    });
  });

  describe("updateSearchResults", () => {
    beforeEach(() => {
      mocked(spellbookApi.search).mockResolvedValue({
        combos: [],
        message: "",
        errors: [],
      });
    });

    it("populates results with cmobos from lookup", async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      mocked(spellbookApi.search).mockResolvedValue({
        combos: [
          spellbookApi.makeFakeCombo({
            cards: ["a", "b", "c"],
            results: ["result 1", "result 2"],
            colorIdentity: "rb",
            commanderSpellbookId: "1",
          }),
          spellbookApi.makeFakeCombo({
            cards: ["d", "e", "f"],
            results: ["result 3", "result 4"],
            colorIdentity: "wb",
            commanderSpellbookId: "2",
          }),
        ],
        message: "",
        errors: [],
      });

      await vm.updateSearchResults("query");
      expect(spellbookApi.search).toBeCalledWith("query");

      expect(vm.paginatedResults).toEqual([
        {
          names: ["a", "b", "c"],
          colors: ["b", "r"],
          results: ["result 1", "result 2"],
          id: "1",
        },
        {
          names: ["d", "e", "f"],
          colors: ["w", "b"],
          results: ["result 3", "result 4"],
          id: "2",
        },
      ]);
    });

    it("automatically redirects to combo page when only a single value is found", async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      mocked(spellbookApi.search).mockResolvedValue({
        combos: [
          spellbookApi.makeFakeCombo({
            cards: ["a", "b", "c"],
            results: ["result 1", "result 2"],
            colorIdentity: "rb",
            commanderSpellbookId: "1",
          }),
        ],
        message: "",
        errors: [],
      });

      await vm.updateSearchResults("query");

      expect($router.replace).toBeCalledWith({
        path: "/combo/1",
        query: {
          q: "query",
        },
      });
    });
  });

  describe("navigateToPage", () => {
    beforeEach(() => {
      $route.query.q = "card:Arjun";
      window.scrollTo = jest.fn();
      jest
        .spyOn(
          (SearchPage as VueComponent).options.methods,
          "updateSearchResults"
        )
        .mockImplementation();
    });

    it("adds to specified number to page", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        page: 3,
      });
      vm.navigateToPage(3);

      expect(vm.page).toBe(6);
    });

    it("supports negative numbers", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        page: 3,
      });
      vm.navigateToPage(-1);

      expect(vm.page).toBe(2);
    });

    it("pushes the query params in the router", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      vm.navigateToPage(3);

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: "card:Arjun",
          page: "4",
        },
      });
    });

    it("preserves the query param for q", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.q = "Sydri";
      vm.navigateToPage(3);

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: "Sydri",
          page: "4",
        },
      });
    });

    it("scrolls to the top of the page", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.q = "Sydri";
      vm.navigateToPage(3);

      expect(window.scrollTo).toBeCalledTimes(1);
      expect(window.scrollTo).toBeCalledWith(0, 0);
    });
  });

  describe("goForward", () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest
        // @ts-ignore
        .spyOn(SearchPage.options.methods, "navigateToPage")
        .mockImplementation();
    });

    it("calls navigateToPage with one page further than the current page", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;
      wrapper.setData({
        page: 2,
      });

      vm.goForward();

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(1);
    });
  });

  describe("goBack", () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest
        // @ts-ignore
        .spyOn(SearchPage.options.methods, "navigateToPage")
        .mockImplementation();
    });

    it("calls navigateToPage with one page back from the current page", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;
      wrapper.setData({
        page: 2,
      });

      vm.goBack();

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(-1);
    });
  });

  describe("updatePageFromQuery", () => {
    it("defaults page to 1 when it is not present in the query", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      delete $route.query.page;

      wrapper.setData({
        page: 2,
      });

      vm.updatePageFromQuery();

      expect(vm.page).toBe(1);
    });

    it("defaults page to 1 when the page query cannot be parsed to a number", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.page = "asdf";

      wrapper.setData({
        page: 2,
      });

      vm.updatePageFromQuery();

      expect(vm.page).toBe(1);
    });

    it("sets page to the value in the query", () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.page = "5";

      wrapper.setData({
        page: 2,
      });

      vm.updatePageFromQuery();

      expect(vm.page).toBe(5);
    });
  });
});
