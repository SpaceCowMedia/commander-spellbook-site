import { shallowMount } from "@vue/test-utils";
import SearchPage from "@/pages/search.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import search from "@/lib/api/search";
import { mocked } from "ts-jest/utils";

import type { MountOptions, Route, Router, VueComponent } from "../types";

jest.mock("@/lib/api/search");

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
    mocked(search).mockResolvedValue({
      sort: "popularity",
      order: "descending",
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
      path: "/search/",
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
      mocked(search).mockResolvedValue({
        combos: [],
        message: "",
        sort: "popularity",
        order: "descending",
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
        maxNumberOfCombosPerPage: 78,
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

    it("updates page when sort is updated", async () => {
      $route.query.q = "ci:temur";
      $route.query.page = "3";
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        sort: "results",
      });

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: { q: "ci:temur sort:results", page: "1" },
      });
    });

    it("updates existing sort option in query when sort is updated", async () => {
      $route.query.q = "sort:popularity ci:temur";
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        sort: "results",
      });

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: { q: "sort:results ci:temur", page: "1" },
      });
    });

    it("updates page when order is updated", async () => {
      $route.query.q = "ci:temur";
      $route.query.page = "3";
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        order: "descending",
      });

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: { q: "ci:temur order:descending" },
      });
    });

    it("updates existing order option in query when order is updated", async () => {
      $route.query.q = "order:ascending ci:temur";
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        order: "descending",
      });

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: { q: "ci:temur order:descending" },
      });
    });

    it("removes order option in query when order is auto", async () => {
      $route.query.q = "order:ascending ci:temur";
      const wrapper = shallowMount(SearchPage, wrapperOptions);

      await wrapper.setData({
        order: "ascending",
      });

      $router.push.mockClear();

      await wrapper.setData({
        order: "auto",
      });

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: { q: "ci:temur" },
      });
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
      mocked(search).mockResolvedValue({
        combos: [],
        message: "",
        sort: "popularity",
        order: "descending",
        errors: [],
      });
    });

    it("populates results with combos from lookup", async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      const combo1 = makeFakeCombo({
        cards: ["a", "b", "c"],
        results: ["result 1", "result 2"],
        colorIdentity: "rb",
        commanderSpellbookId: "1",
        numberOfEDHRECDecks: 12,
      });
      const combo2 = makeFakeCombo({
        cards: ["d", "e", "f"],
        results: ["result 3", "result 4"],
        colorIdentity: "wb",
        commanderSpellbookId: "2",
        numberOfEDHRECDecks: 20,
      });
      mocked(search).mockResolvedValue({
        combos: [combo1, combo2],
        message: "",
        sort: "popularity",
        order: "descending",
        errors: [],
      });

      await vm.updateSearchResults("query");
      expect(search).toBeCalledWith("query");

      expect(vm.paginatedResults).toEqual([combo1, combo2]);
    });

    it("automatically redirects to combo page when only a single value is found", async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      mocked(search).mockResolvedValue({
        combos: [
          makeFakeCombo({
            cards: ["a", "b", "c"],
            results: ["result 1", "result 2"],
            colorIdentity: "rb",
            commanderSpellbookId: "1",
          }),
        ],
        sort: "popularity",
        order: "descending",
        message: "",
        errors: [],
      });

      await vm.updateSearchResults("query");

      expect(vm.redirecting).toBe(true);

      expect($router.replace).toBeCalledWith({
        path: "/combo/1/",
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
        path: "/search/",
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
        path: "/search/",
        query: {
          q: "Sydri",
          page: "4",
        },
      });
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
