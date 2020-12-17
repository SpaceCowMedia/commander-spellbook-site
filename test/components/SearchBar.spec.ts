import { mount } from "@vue/test-utils";
import SearchBar from "@/components/SearchBar.vue";
import spellbookApi from "commander-spellbook";
import { mocked } from "ts-jest/utils";
import type { MountOptions, Route, Router, VueComponent } from "../types";

jest.mock("commander-spellbook");

describe("SearchBar", () => {
  let wrapperOptions: MountOptions;
  let $route: Route;
  let $router: Router;

  beforeEach(() => {
    $route = {
      path: "",
      query: {},
    };
    $router = {
      push: jest.fn(),
    };
    wrapperOptions = {
      mocks: {
        $route,
        $router,
      },
    };
  });

  it("can set an classes on the input", () => {
    wrapperOptions!.propsData = {
      inputClass: "custom class names",
    };
    const wrapper = mount(SearchBar, wrapperOptions);

    expect(wrapper.find(".main-search-input").classes()).toContain("custom");
    expect(wrapper.find(".main-search-input").classes()).toContain("class");
    expect(wrapper.find(".main-search-input").classes()).toContain("names");
  });

  it("sets query from the query param if available", () => {
    $route.query.q = "card:sydri";
    const wrapper = mount(SearchBar, wrapperOptions);

    expect((wrapper.vm as VueComponent).query).toBe("card:sydri");
  });

  it("does not set query if it is not a string", () => {
    // @ts-ignore
    $route.query.q = ["card:sydri"];
    const wrapper = mount(SearchBar, wrapperOptions);

    expect((wrapper.vm as VueComponent).query).toBe("");
  });

  it("it triggers onEnter when enter key is pressed", async () => {
    const wrapper = mount(SearchBar, wrapperOptions);
    const vm = wrapper.vm as VueComponent;

    jest.spyOn(vm, "onEnter");

    await wrapper.find("input").trigger("keydown.enter");

    expect(vm.onEnter).toBeCalledTimes(1);
  });

  describe("lookupNumberOfCombos", () => {
    it("sets numberOfCombos to the number of combos found in spellbook api", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const mockCombo = spellbookApi.makeFakeCombo();

      mocked(spellbookApi.search).mockResolvedValue([mockCombo]);

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search .... combos");

      await (wrapper.vm as VueComponent).lookupNumberOfCombos();

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search 1 combos");
    });
  });

  describe("onEnter", () => {
    it("noops when there is no query", () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      (wrapper.vm as VueComponent).onEnter();

      expect($router.push).not.toBeCalled();
    });

    it("noops when the query is made up of blank spaces", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setData({ query: "      " });

      (wrapper.vm as VueComponent).onEnter();

      expect($router.push).not.toBeCalled();
    });

    it("redirects to /search with query", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setData({ query: "card:Rashmi" });

      (wrapper.vm as VueComponent).onEnter();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith("/search?q=card:Rashmi");
    });

    it("dispatches event when on the search path", async () => {
      $route.path = "/search";

      const wrapper = mount(SearchBar, wrapperOptions);
      jest.spyOn(wrapper.vm, "$emit");

      await wrapper.setData({ query: "card:Rashmi" });

      (wrapper.vm as VueComponent).onEnter();

      expect($router.push).not.toBeCalled();
      expect((wrapper.vm as VueComponent).$emit).toBeCalledTimes(1);
      expect((wrapper.vm as VueComponent).$emit).toBeCalledWith(
        "new-query",
        "card:Rashmi"
      );
    });
  });
});
