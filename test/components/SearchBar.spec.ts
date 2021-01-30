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
      stubs: {
        ArtCircle: true,
        NuxtLink: true,
      },
      mocks: {
        $route,
        $router,
      },
    };
  });

  it("can set classes on the input", () => {
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
    // @ts-ignore
    jest.spyOn(SearchBar.options.methods, "setQueryFromUrl");
    const wrapper = mount(SearchBar, wrapperOptions);
    const vm = wrapper.vm as VueComponent;

    expect(vm.query).toBe("card:sydri");
    // @ts-ignore
    expect(SearchBar.options.methods.setQueryFromUrl).toBeCalledTimes(1);
  });

  it("it triggers onSubmit when enter key is pressed", async () => {
    const wrapper = mount(SearchBar, wrapperOptions);
    const vm = wrapper.vm as VueComponent;

    jest.spyOn(vm, "onSubmit");

    await wrapper.find("form").trigger("submit");

    expect(vm.onSubmit).toBeCalledTimes(1);
  });

  it("can opt out of logo link", async () => {
    const NuxtLinkStub = {
      props: ["to"],
      template: "<div></div>",
    };
    // @ts-ignore
    wrapperOptions.stubs.NuxtLink = NuxtLinkStub;
    const wrapper = mount(SearchBar, wrapperOptions);

    const link = wrapper.findComponent(NuxtLinkStub);

    expect(link.props("to")).toBe("/");

    await wrapper.setProps({
      includeLogo: false,
    });

    expect(wrapper.findComponent(NuxtLinkStub).exists()).toBe(false);
  });

  describe("lookupNumberOfCombos", () => {
    it("sets numberOfCombos to the number of combos found in spellbook api", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const mockCombo = spellbookApi.makeFakeCombo();

      mocked(spellbookApi.getAllCombos).mockResolvedValue([mockCombo]);

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search .... combos");

      await (wrapper.vm as VueComponent).lookupNumberOfCombos();

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search 1 combos");
    });
  });

  describe("onSubmit", () => {
    it("noops when there is no query", () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      (wrapper.vm as VueComponent).onSubmit();

      expect($router.push).not.toBeCalled();
    });

    it("noops when the query is made up of blank spaces", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setData({ query: "      " });

      (wrapper.vm as VueComponent).onSubmit();

      expect($router.push).not.toBeCalled();
    });

    it("redirects to /search with query", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setData({ query: "card:Rashmi" });

      (wrapper.vm as VueComponent).onSubmit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search",
        query: {
          q: "card:Rashmi",
        },
      });
    });
  });

  describe("setQueryFromUrl", () => {
    it("sets query to empty string when there is no query in url", () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        query: "foo",
      });

      vm.setQueryFromUrl();

      expect(vm.query).toBe("");
    });

    it("sets query to empty string when the query in the url is not a string", () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      // @ts-ignore
      $route.query.q = ["card:sydri"];

      wrapper.setData({
        query: "foo",
      });

      vm.setQueryFromUrl();

      expect(vm.query).toBe("");
    });

    it("sets query to query string when the query in the url is a string", () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.q = "some-query";

      wrapper.setData({
        query: "foo",
      });

      vm.setQueryFromUrl();

      expect(vm.query).toBe("some-query");
    });
  });
});
