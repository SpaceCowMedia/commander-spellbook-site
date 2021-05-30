import { mount } from "@vue/test-utils";
import SearchBar from "@/components/SearchBar.vue";
import makeFakeCombo from "@/lib/api/make-fake-combo";
import getAllCombos from "@/lib/api/get-all-combos";
import { mocked } from "ts-jest/utils";
import type { MountOptions, Route, Router, VueComponent } from "../types";

jest.mock("@/lib/api/get-all-combos");

describe("SearchBar", () => {
  let wrapperOptions: MountOptions;
  let $route: Route;
  let $router: Router;
  let $emit: jest.SpyInstance;

  beforeEach(() => {
    $emit = jest.fn();
    $route = {
      path: "",
      query: {},
    };
    $router = {
      push: jest.fn(),
    };
    wrapperOptions = {
      stubs: {
        NuxtLink: true,
      },
      mocks: {
        $emit,
        $route,
        $router,
        $gtag: {
          event: jest.fn(),
        },
      },
    };
  });

  it("sets query from the query param when mounting", () => {
    $route.query.q = "card:sydri";
    // @ts-ignore
    jest.spyOn(SearchBar.options.methods, "setQueryFromUrl");
    mount(SearchBar, wrapperOptions);

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

  it("does not display navigation links when on home page", async () => {
    const NuxtLinkStub = {
      props: ["to"],
      template: "<div></div>",
    };
    const RandomButtonStub = {
      props: ["query"],
      template: "<div><slot /></div>",
    };
    // @ts-ignore
    wrapperOptions.stubs.NuxtLink = NuxtLinkStub;
    // @ts-ignore
    wrapperOptions.stubs.RandomButton = RandomButtonStub;
    const wrapper = mount(SearchBar, wrapperOptions);

    const links = wrapper.findAllComponents(NuxtLinkStub);

    expect(links.at(0).props("to")).toBe("/");
    expect(links.at(1).props("to")).toBe("/advanced-search/");
    expect(links.at(2).props("to")).toBe("/syntax-guide/");
    expect(wrapper.findComponent(RandomButtonStub)).toBeTruthy();

    await wrapper.setProps({
      onHomePage: true,
    });

    expect(wrapper.findComponent(NuxtLinkStub).exists()).toBe(false);
    expect(wrapper.findComponent(RandomButtonStub).exists()).toBe(false);
  });

  it("includes the autofocus attribute on home page", async () => {
    const wrapper = mount(SearchBar, wrapperOptions);

    expect(
      wrapper.find("#search-bar-input").attributes("autofocus")
    ).toBeFalsy();

    await wrapper.setProps({
      onHomePage: true,
    });

    expect(
      wrapper.find("#search-bar-input").attributes("autofocus")
    ).toBeTruthy();
  });

  it("applies q query if applicable to random button", async () => {
    const RandomButtonStub = {
      props: ["query"],
      template: "<div><slot /></div>",
    };
    // @ts-ignore
    wrapperOptions.stubs.RandomButton = RandomButtonStub;
    const wrapper = mount(SearchBar, wrapperOptions);
    const randomButton = wrapper.findComponent(RandomButtonStub);

    expect(randomButton.props("query")).toEqual("");

    await wrapper.setProps({
      value: "search",
    });

    expect(randomButton.props("query")).toEqual("search");
  });

  it("toggles link menu when menu button is clicked", async () => {
    const wrapper = mount(SearchBar, wrapperOptions);
    const vm = wrapper.vm as VueComponent;

    expect(vm.showMobileMenu).toBe(false);

    await wrapper.find("#search-bar-menu-button").trigger("click");

    expect(vm.showMobileMenu).toBe(true);
  });

  describe("lookupNumberOfCombos", () => {
    it("sets numberOfCombos to the number of combos found in spellbook api", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const mockCombo = makeFakeCombo();

      mocked(getAllCombos).mockResolvedValue([mockCombo]);

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search thousands of EDH combos");

      await (wrapper.vm as VueComponent).lookupNumberOfCombos();

      expect(
        wrapper.find(".main-search-input").element.getAttribute("placeholder")
      ).toBe("Search 1 EDH combos");
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

      await wrapper.setProps({ value: "      " });

      (wrapper.vm as VueComponent).onSubmit();

      expect($router.push).not.toBeCalled();
    });

    it("redirects to /search with query", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setProps({ value: "card:Rashmi" });

      (wrapper.vm as VueComponent).onSubmit();

      expect($router.push).toBeCalledTimes(1);
      expect($router.push).toBeCalledWith({
        path: "/search/",
        query: {
          q: "card:Rashmi",
        },
      });
    });

    it("sends an analytics event", async () => {
      // @ts-ignore
      const eventSpy = wrapperOptions.mocks.$gtag.event;
      const wrapper = mount(SearchBar, wrapperOptions);

      await wrapper.setProps({ value: "card:Rashmi" });

      (wrapper.vm as VueComponent).onSubmit();

      expect(eventSpy).toBeCalledTimes(1);
      expect(eventSpy).toBeCalledWith("search", {
        search_term: "card:Rashmi",
      });
    });
  });

  describe("setQueryFromUrl", () => {
    it("updates query to empty string when there is no query in url", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      await wrapper.setProps({
        value: "foo",
      });

      expect(vm.query).toBe("foo");

      $emit.mockReset();
      vm.setQueryFromUrl();

      expect($emit).toBeCalledTimes(1);
      expect($emit).toBeCalledWith("input", "");
    });

    it("updates query to empty string when the query in the url is not a string", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      // @ts-ignore
      $route.query.q = ["card:sydri"];

      await wrapper.setProps({
        value: "foo",
      });

      $emit.mockReset();
      vm.setQueryFromUrl();

      expect($emit).toBeCalledTimes(1);
      expect($emit).toBeCalledWith("input", "");
    });

    it("updates query to query string when the query in the url is a string", async () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      $route.query.q = "some-query";

      await wrapper.setProps({
        value: "foo",
      });

      $emit.mockReset();
      vm.setQueryFromUrl();

      expect($emit).toBeCalledTimes(1);
      expect($emit).toBeCalledWith("input", "some-query");
    });
  });

  describe("toggleMenu", () => {
    it("toggles showMobileMenu state", () => {
      const wrapper = mount(SearchBar, wrapperOptions);
      const vm = wrapper.vm as VueComponent;

      wrapper.setData({
        showMobileMenu: false,
      });

      vm.toggleMenu();

      expect(vm.showMobileMenu).toBe(true);

      vm.toggleMenu();

      expect(vm.showMobileMenu).toBe(false);
    });
  });
});
